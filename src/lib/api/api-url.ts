export function getPublicApiRoot(): string {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  ).trim();
  return raw.replace(/\/+$/, '');
}

export function getPublicApiV1Base(): string {
  return `${getPublicApiRoot()}/api/v1`;
}
