import { handle } from '../../../lib/server/http';
import { catalog } from '../../../lib/server/operations';
import { publicClient } from '../../../lib/server/supabase';

export const dynamic = 'force-dynamic';
export function GET(request: Request) { return handle(request, async () => catalog(publicClient())); }
