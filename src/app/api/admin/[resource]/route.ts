import { assertOrigin, handle, readJson } from '../../../../lib/server/http';
import { adminDelete, adminList, adminPatch, adminSave, resource } from '../../../../lib/server/operations';
import { adminSession, cookieClient } from '../../../../lib/server/supabase';

type RouteContext = { params: Promise<{ resource: string }> };
export const dynamic = 'force-dynamic';
function execute(request: Request, route: RouteContext, method: 'GET' | 'POST' | 'PATCH' | 'DELETE') {
  return handle(request, async context => {
    if (method !== 'GET') assertOrigin(request);
    const client = await cookieClient(context);
    await adminSession(client);
    const name = resource((await route.params).resource);
    if (method === 'GET') return adminList(client, name);
    if (method === 'DELETE') return adminDelete(client, name, new URL(request.url).searchParams.get('id'));
    const body = await readJson(request);
    return method === 'POST' ? adminSave(client, name, body) : adminPatch(client, name, body);
  });
}
export function GET(request: Request, context: RouteContext) { return execute(request, context, 'GET'); }
export function POST(request: Request, context: RouteContext) { return execute(request, context, 'POST'); }
export function PATCH(request: Request, context: RouteContext) { return execute(request, context, 'PATCH'); }
export function DELETE(request: Request, context: RouteContext) { return execute(request, context, 'DELETE'); }
