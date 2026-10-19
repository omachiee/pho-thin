import { handle } from '../../../../lib/server/http';
import { reservationAvailability } from '../../../../lib/server/operations';
import { serviceClient } from '../../../../lib/server/supabase';
import { ApiError, date, id } from '../../../../lib/server/validation';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handle(request, async () => {
    const url = new URL(request.url);
    const branchId = url.searchParams.get('branchId');
    const dateParam = url.searchParams.get('date');

    if (!branchId || !dateParam) {
      throw new ApiError(400, 'Thiếu cơ sở hoặc ngày đặt bàn.');
    }

    let validBranchId: string;
    let validDate: string;
    try {
      validBranchId = id(branchId);
      validDate = date(dateParam);
    } catch {
      throw new ApiError(400, 'Thiếu cơ sở hoặc ngày đặt bàn.');
    }

    return reservationAvailability(serviceClient(), validBranchId, validDate);
  });
}
