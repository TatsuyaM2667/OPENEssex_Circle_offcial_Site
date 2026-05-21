interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const url = new URL(context.request.url);
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');

  try {
    let query = 'SELECT * FROM calendar_events';
    const bindings: string[] = [];

    if (year && month) {
      // Filter by year-month (YYYY-MM prefix match)
      const prefix = `${year}-${month.padStart(2, '0')}`;
      query += ' WHERE event_date LIKE ?';
      bindings.push(`${prefix}%`);
    }

    query += ' ORDER BY event_date ASC, start_time ASC';

    const stmt = DB.prepare(query);
    const { results } = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();

    return Response.json(results, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: 'Failed to fetch calendar events', detail: error?.message },
      { status: 500 }
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  try {
    const data: any = await context.request.json();

    if (!data.title || !data.event_date || !data.author_uid || !data.author_name) {
      return Response.json(
        { error: 'Missing required fields (title, event_date, author_uid, author_name)' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.event_date)) {
      return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }

    await DB.prepare(
      `INSERT INTO calendar_events (title, description, event_date, start_time, end_time, color, author_uid, author_name, author_avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        data.title.slice(0, 100),
        (data.description || '').slice(0, 500),
        data.event_date,
        (data.start_time || '').slice(0, 5),
        (data.end_time || '').slice(0, 5),
        (data.color || '#ff4766').slice(0, 20),
        data.author_uid,
        data.author_name.slice(0, 100),
        (data.author_avatar || '').slice(0, 2000)
      )
      .run();

    return Response.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return Response.json(
      { error: 'Failed to create event', detail: error?.message },
      { status: 500 }
    );
  }
};
