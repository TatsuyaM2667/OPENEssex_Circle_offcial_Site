interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const uid = context.params.uid as string;

  const result = await DB.prepare(
    "SELECT uid, display_name, email, avatar_url, bio, role, skills, linkedin_url, github_url, website_url, created_at FROM profiles WHERE uid = ?"
  ).bind(uid).first();

  if (!result) {
    return new Response("Profile not found", { status: 404 });
  }

  return Response.json(result);
};
