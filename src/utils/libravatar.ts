async function sha256hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function libravatarUrl(email: string, size = 80, fallback = 'identicon'): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const hash = await sha256hex(normalized);
  return `https://seccdn.libravatar.org/avatar/${hash}?s=${size}&d=${fallback}`;
}
