interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const { results } = await DB.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
  return Response.json(results, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=120' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  
  try {
    const data: any = await context.request.json();
    
    if (!data.title || !data.description || !data.author) {
      return new Response("Missing fields", { status: 400 });
    }

    await DB.prepare("INSERT INTO projects (title, description, author, status) VALUES (?, ?, ?, ?)")
      .bind(data.title, data.description, data.author, data.status || 'planning')
      .run();

    return new Response("Success", { status: 201 });
  } catch (error) {
    return new Response("Error processing request", { status: 500 });
  }
};
