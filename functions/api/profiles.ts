interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const { results } = await DB.prepare(
    "SELECT uid, display_name, avatar_url, bio, role, skills, linkedin_url, github_url, website_url, created_at FROM profiles ORDER BY created_at ASC"
  ).all();
  return Response.json(results, {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const data: any = await context.request.json();

  if (!data.uid || !data.display_name) {
    return new Response("Missing uid or display_name", { status: 400 });
  }

  // Upsert: create or update profile
  await DB.prepare(
    `INSERT INTO profiles (uid, display_name, email, avatar_url, bio, role, skills, linkedin_url, github_url, website_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(uid) DO UPDATE SET
       display_name = excluded.display_name,
       email = excluded.email,
       avatar_url = excluded.avatar_url,
       bio = excluded.bio,
       role = excluded.role,
       skills = excluded.skills,
       linkedin_url = excluded.linkedin_url,
       github_url = excluded.github_url,
       website_url = excluded.website_url,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(
    data.uid,
    data.display_name,
    data.email || '',
    data.avatar_url || '',
    data.bio || '',
    data.role || 'Member',
    data.skills || '',
    data.linkedin_url || '',
    data.github_url || '',
    data.website_url || ''
  ).run();

  return new Response("Success", { status: 201 });
};
