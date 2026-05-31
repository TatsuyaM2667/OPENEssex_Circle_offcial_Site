interface Env {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const id = (context.params as any).id;

  try {
    const data: any = await context.request.json();

    if (!data.title || !data.event_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await DB.prepare(
      `UPDATE calendar_events
       SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, color = ?
       WHERE id = ?`
    )
      .bind(
        data.title.slice(0, 100),
        (data.description || '').slice(0, 500),
        data.event_date,
        (data.start_time || '').slice(0, 5),
        (data.end_time || '').slice(0, 5),
        (data.color || '#ff4766').slice(0, 20),
        id
      )
      .run();

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { error: 'Failed to update event', detail: error?.message },
      { status: 500 }
    );
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const id = (context.params as any).id;

  try {
    await DB.prepare('DELETE FROM calendar_events WHERE id = ?').bind(id).run();
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { error: 'Failed to delete event', detail: error?.message },
      { status: 500 }
    );
  }
};
