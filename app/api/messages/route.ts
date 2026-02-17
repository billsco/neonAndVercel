import { NextResponse } from 'next/server';
import { getSql } from '../../../lib/db';

type MessageRow = {
  id: number;
  text: string;
  created_at: string;
};

type RequestBody = {
  text?: unknown;
};

export async function GET() {
  try {
    const sql = getSql();
    const rows = (await sql`
      select id, text, created_at
      from messages
      order by id desc
      limit 50
    `) as MessageRow[];
    return NextResponse.json({ messages: rows }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read messages.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Body must be valid JSON.' }, { status: 400 });
  }

  if (typeof body.text !== 'string' || body.text.trim().length === 0) {
    return NextResponse.json({ error: 'Field "text" must be a non-empty string.' }, { status: 400 });
  }

  try {
    const sql = getSql();
    const inserted = (await sql`
      insert into messages (text)
      values (${body.text.trim()})
      returning id, text, created_at
    `) as MessageRow[];
    return NextResponse.json({ message: inserted[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to write message.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
