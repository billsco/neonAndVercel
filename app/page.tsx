'use client';

import { FormEvent, useState } from 'react';

type ReverseResponse = {
  reversed: string;
};

export default function HomePage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const payload = (await response.json()) as ReverseResponse | { error: string };

      if (!response.ok || !('reversed' in payload)) {
        throw new Error('error' in payload ? payload.error : 'Request failed');
      }

      setResult(payload.reversed);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unexpected error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Hello World</h1>
      <p>Type text below and click reverse.</p>

      <form onSubmit={onSubmit}>
        <label htmlFor="input-text">Text</label>
        <input
          id="input-text"
          name="inputText"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="foo"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Working...' : 'Reverse Text'}
        </button>
      </form>

      {result ? <p className="output">Server replied: {result}</p> : null}
      {error ? <p className="error">Error: {error}</p> : null}
    </main>
  );
}
