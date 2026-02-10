import { auth } from '@clerk/nextjs/server';
import { query } from './db';

export async function getFamily() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  // Check if family exists
  let result = await query('SELECT * FROM families WHERE clerk_id = $1', [userId]);

  if (result.rows.length === 0) {
    // Auto-create family and member
    result = await query(
      'INSERT INTO families (name, clerk_id) VALUES ($1, $2) RETURNING *',
      ['My Family', userId]
    );
    await query(
      'INSERT INTO family_members (family_id, name, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, 'Me', 'parent']
    );
  }

  return result.rows[0];
}

export async function requireFamily() {
  const family = await getFamily();
  if (!family) {
    throw new Error('Unauthorized');
  }
  return family;
}
