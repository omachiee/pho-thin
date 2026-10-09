import { assertOrigin, handle, readJson } from '../../../lib/server/http';
import { createOrder } from '../../../lib/server/operations';
import { serviceClient } from '../../../lib/server/supabase';

export function POST(request: Request) {
  return handle(request, async () => { assertOrigin(request); const body = await readJson(request); return createOrder(serviceClient(), body); });
}
