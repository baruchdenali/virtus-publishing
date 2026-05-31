import { getDb } from './api/queries/connection';

async function main() {
  try {
    const db = getDb();
    const result = await (db as any).$client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    );
    console.log('Columns:', result.rows.map((c: any) => c.column_name).join(', '));
  } catch (e: any) {
    console.log('ERR:', e.message);
  }
}
main();
