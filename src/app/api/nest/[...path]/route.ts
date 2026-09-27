import { getPublicApiV1Base } from '@/lib/api/api-url';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const FORWARDED_HEADERS = ['content-type', 'accept', 'accept-language'];

async function getSessionToken(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.session?.token ?? '';
  } catch {
    return '';
  }
}

function buildNestUrl(path: string[], request: NextRequest): URL {
  const base = getPublicApiV1Base();
  const nestPath = path.join('/');
  const url = new URL(`${base}/${nestPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url;
}

async function proxyToNest(request: NextRequest, path: string[]) {
  const sessionToken = await getSessionToken();
  const nestUrl = buildNestUrl(path, request);

  const proxyHeaders: Record<string, string> = {};
  FORWARDED_HEADERS.forEach((header) => {
    const value = request.headers.get(header);
    if (value) proxyHeaders[header] = value;
  });

  if (sessionToken) {
    proxyHeaders.Authorization = `Bearer ${sessionToken}`;
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const nestResponse = await fetch(nestUrl.toString(), {
    method: request.method,
    headers: proxyHeaders,
    body,
    credentials: 'include',
  });

  const responseBody = await nestResponse.text();
  return new NextResponse(responseBody, {
    status: nestResponse.status,
    headers: {
      'content-type':
        nestResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyToNest(request, path);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyToNest(request, path);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyToNest(request, path);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyToNest(request, path);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyToNest(request, path);
}
