interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const nameParam = context.params.name as string;
  const decodedName = decodeURIComponent(nameParam);

  try {
    const { results } = await DB.prepare(`
      SELECT id, title, 'documents' as section, created_at FROM documents WHERE author = ? OR co_authors LIKE ?
      UNION ALL
      SELECT id, title, 'guides' as section, created_at FROM guides WHERE poster = ? OR co_authors LIKE ?
      UNION ALL
      SELECT id, title, 'books' as section, created_at FROM books WHERE poster = ? OR co_authors LIKE ?
      UNION ALL
      SELECT id, title, 'timeline' as section, created_at FROM timeline WHERE author = ?
      UNION ALL
      SELECT id, title, 'projects' as section, created_at FROM projects WHERE author = ? OR co_authors LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `)
      .bind(
        decodedName, `%${decodedName}%`,
        decodedName, `%${decodedName}%`,
        decodedName, `%${decodedName}%`,
        decodedName,
        decodedName, `%${decodedName}%`
      )
      .all();

    return Response.json(results, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=120' }
    });
  } catch (err) {
    return new Response("Error " + err, { status: 500 });
  }
};
