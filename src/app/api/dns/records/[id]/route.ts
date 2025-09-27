import { NextRequest } from 'next/server';
import { PartialRecord } from '@/lib/validation/dns';
import { getAuthUser } from '@/lib/simple-auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { updateRecord, deleteRecord } from '@/lib/cloudflare';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!hasPermission(user, 'editDNS')) {
      return apiError('forbidden', 'No permission to edit DNS records', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = PartialRecord.parse(body);

    // For demo records, just return success
    if (id.startsWith('demo-')) {
      return apiSuccess({
        id,
        ...validatedData,
        modified_on: new Date().toISOString(),
      });
    }

    // Update record in Cloudflare (if configured)
    try {
      const cfResponse = await updateRecord(id, validatedData);

      if (!cfResponse.success) {
        return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Failed to update DNS record', 502);
      }

      return apiSuccess(cfResponse.result);
    } catch (cfError) {
      return apiError('cf_api_error', 'Cloudflare API not configured', 502);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!hasPermission(user, 'deleteDNS')) {
      return apiError('forbidden', 'No permission to delete DNS records', 403);
    }

    const { id } = await params;

    // For demo records, just return success
    if (id.startsWith('demo-')) {
      return apiSuccess({ id, deleted: true });
    }

    // Delete record from Cloudflare (if configured)
    try {
      const cfResponse = await deleteRecord(id);

      if (!cfResponse.success) {
        return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Failed to delete DNS record', 502);
      }

      return apiSuccess({ id, deleted: true });
    } catch (cfError) {
      return apiError('cf_api_error', 'Cloudflare API not configured', 502);
    }
  } catch (error) {
    return handleApiError(error);
  }
}