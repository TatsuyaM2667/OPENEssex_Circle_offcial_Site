interface Env {
  DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const id = context.params.id;
  const data: any = await context.request.json();

  if (data.action === 'like') {
    await DB.prepare("UPDATE projects SET likes = likes + 1 WHERE id = ?").bind(id).run();
  } else if (data.action === 'unlike') {
    await DB.prepare("UPDATE projects SET likes = MAX(COALESCE(likes, 0) - 1, 0) WHERE id = ?").bind(id).run();
  } else if (data.action === 'edit') {
    await DB.prepare("UPDATE projects SET title = ?, description = ?, status = ?, co_authors = ? WHERE id = ?")
      .bind(data.title, data.description, data.status, data.co_authors || '', id)
      .run();
  } else {
    return new Response("Invalid action", { status: 400 });
  }

  return new Response("Updated", { status: 200 });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const id = context.params.id;

  await DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();

  return new Response("Deleted", { status: 200 });
};
