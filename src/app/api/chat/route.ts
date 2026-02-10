import { NextResponse } from 'next/server';
import { requireFamily } from '@/lib/auth';
import { query } from '@/lib/db';

function buildSystemPrompt(family: { name: string }, members: unknown[], reminders: unknown[], context: unknown[]) {
  const memberLines = (members as Array<{ name: string; role: string; age?: number; school?: string; work?: string; notes?: string }>)
    .map(m => `- ${m.name} (${m.role})${m.age ? `, age ${m.age}` : ''}. ${m.school || m.work || ''}. ${m.notes || ''}`.trim())
    .join('\n');

  const contextLines = (context as Array<{ key: string; content: string }>)
    .map(c => `- ${c.key}: ${c.content}`)
    .join('\n');

  const reminderLines = (reminders as Array<{ title: string; due_at?: string; assigned_to?: string }>)
    .map(r => `- ${r.title} (due: ${r.due_at || 'no date'}, for: ${r.assigned_to || 'anyone'})`)
    .join('\n');

  return `You are Marvin, a helpful family assistant with a warm personality and subtle wit. You know this family well.

Family: ${family.name}

Family Members:
${memberLines || '(none yet)'}

Family Notes:
${contextLines || '(none yet)'}

Active Reminders:
${reminderLines || '(none)'}

Guidelines:
- Be helpful, warm, and concise. Families are busy.
- Reference family members by name when relevant.
- If asked to set a reminder, include it in this exact format at the end of your response:
  [REMINDER: title | YYYY-MM-DD HH:MM | person_name]
- If asked about meals, consider any dietary notes in the family context.
- Keep responses short unless asked for detail.`;
}

function extractReminders(text: string): Array<{ title: string; due_at: string | null; assigned_to: string | null }> {
  const regex = /\[REMINDER:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\]/g;
  const results: Array<{ title: string; due_at: string | null; assigned_to: string | null }> = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push({
      title: match[1],
      due_at: match[2] !== 'none' ? match[2] : null,
      assigned_to: match[3] !== 'none' ? match[3] : null,
    });
  }
  return results;
}

export async function POST(request: Request) {
  try {
    const family = await requireFamily();
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json({ error: 'conversationId and message required' }, { status: 400 });
    }

    // Verify conversation belongs to family
    const conv = await query('SELECT * FROM conversations WHERE id = $1 AND family_id = $2', [conversationId, family.id]);
    if (conv.rows.length === 0) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    // Store user message
    await query('INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)', [conversationId, 'user', message]);
    await query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [conversationId]);

    // Load context
    const [members, reminders, context, history] = await Promise.all([
      query('SELECT * FROM family_members WHERE family_id = $1', [family.id]),
      query('SELECT * FROM reminders WHERE family_id = $1 AND completed = FALSE', [family.id]),
      query('SELECT * FROM family_context WHERE family_id = $1', [family.id]),
      query('SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at', [conversationId]),
    ]);

    const systemPrompt = buildSystemPrompt(family, members.rows, reminders.rows, context.rows);

    // Call Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history.rows.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          systemInstruction: { parts: [{ text: systemPrompt }] },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await geminiResponse.json();
    const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I had trouble thinking of a response.';

    // Store assistant message
    await query('INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)', [conversationId, 'assistant', assistantContent]);

    // Extract and create reminders
    const extractedReminders = extractReminders(assistantContent);
    for (const r of extractedReminders) {
      await query(
        'INSERT INTO reminders (family_id, title, due_at, assigned_to) VALUES ($1, $2, $3, $4)',
        [family.id, r.title, r.due_at, r.assigned_to]
      );
    }

    return NextResponse.json({ message: assistantContent });
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('Chat error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
