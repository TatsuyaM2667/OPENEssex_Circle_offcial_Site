interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  
  try {
    const data: any = await context.request.json();
    const { year, month, author_uid, author_name, author_avatar } = data;
    
    if (!year || !month || !author_uid || !author_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    
    // 既存の午前・午後授業を取得して重複を防止
    const { results } = await DB.prepare(
      "SELECT event_date, title FROM calendar_events WHERE event_date LIKE ? AND (title = '午前授業' OR title = '午後授業')"
    ).bind(`${prefix}%`).all();
    
    const existing = new Set(results.map(r => `${r.event_date}_${r.title}`));

    const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-12
    const statements = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // 平日 (1:月曜日 〜 5:金曜日)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (!existing.has(`${dateStr}_午前授業`)) {
          statements.push(
            DB.prepare(
              `INSERT INTO calendar_events (title, description, event_date, start_time, end_time, color, author_uid, author_name, author_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind('午前授業', '', dateStr, '10:00', '12:00', '#3b82f6', author_uid, author_name, author_avatar || '')
          );
        }
        
        if (!existing.has(`${dateStr}_午後授業`)) {
          statements.push(
            DB.prepare(
              `INSERT INTO calendar_events (title, description, event_date, start_time, end_time, color, author_uid, author_name, author_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind('午後授業', '', dateStr, '13:00', '15:00', '#f59e0b', author_uid, author_name, author_avatar || '')
          );
        }
      }
    }

    if (statements.length > 0) {
      // D1バッチ制限(1回100件など)があるが、平日約22日×2件=44件なので1回のバッチで可能
      await DB.batch(statements);
    }

    return Response.json({ success: true, count: statements.length });
  } catch (error: any) {
    return Response.json({ error: 'Failed to generate events', detail: error?.message }, { status: 500 });
  }
};
