interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const { results } = await DB.prepare("SELECT * FROM guides ORDER BY created_at DESC").all();
  return Response.json(results, {
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const data: any = await context.request.json();
  
  if (!data.title || !data.content || !data.poster) {
    return new Response("Missing fields", { status: 400 });
  }

  await DB.prepare("INSERT INTO guides (title, content, poster, co_authors) VALUES (?, ?, ?, ?)")
    .bind(data.title, data.content, data.poster, data.co_authors || '')
    .run();

  return new Response("Success", { status: 201 });
};
