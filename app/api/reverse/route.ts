import { NextResponse } from 'next/server';

type RequestBody = {
  text?: unknown;
};

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Body must be valid JSON.' }, { status: 400 });
  }

  if (typeof body.text !== 'string') {
    return NextResponse.json({ error: 'Field "text" must be a string.' }, { status: 400 });
  }

  const reversed = [...body.text].reverse().join('');
  return NextResponse.json({ reversed }, { status: 200 });
}
