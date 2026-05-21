interface Env {
  DB: D1Database;
}
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const year = 2026;
  const month = 6;
  
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const res = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      res.push({ dateStr, dayOfWeek });
    }
  }
  return Response.json({ prefix, daysInMonth, result: res });
};
