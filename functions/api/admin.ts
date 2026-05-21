interface Env {
  DB: D1Database;
}

// Admin endpoint: update member role or delete member
// Only accessible by users with CTO role
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  try {
    const data: any = await context.request.json();

    if (!data.admin_uid) {
      return Response.json({ error: 'admin_uid is required' }, { status: 400 });
    }

    // Verify the requesting user is CTO
    const admin = await DB.prepare(
      "SELECT role FROM profiles WHERE uid = ?"
    ).bind(data.admin_uid).first();

    if (!admin || !admin.role || !(admin.role as string).toUpperCase().includes('CTO')) {
      return Response.json({ error: 'Permission denied. Only CTO can perform admin actions.' }, { status: 403 });
    }

    if (data.action === 'update_member') {
      if (!data.target_uid) {
        return Response.json({ error: 'target_uid is required' }, { status: 400 });
      }

      await DB.prepare(
        "UPDATE profiles SET role = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?"
      ).bind(data.new_role || '', data.new_avatar_url || '', data.target_uid).run();

      return Response.json({ success: true, message: 'Profile updated' });
    }

    if (data.action === 'delete_member') {
      if (!data.target_uid) {
        return Response.json({ error: 'target_uid is required' }, { status: 400 });
      }

      // Don't allow deleting yourself
      if (data.target_uid === data.admin_uid) {
        return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
      }

      await DB.prepare("DELETE FROM profiles WHERE uid = ?").bind(data.target_uid).run();

      return Response.json({ success: true, message: 'Member deleted' });
    }

    return Response.json({ error: 'Unknown action. Use "update_member" or "delete_member"' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: 'Admin action failed', detail: error?.message }, { status: 500 });
  }
};
