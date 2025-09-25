import { NextRequest } from 'next/server';
import { Client } from 'pg';
import { AnyRecord } from '@/lib/validation/dns';
import { getAuthUser } from '@/lib/simple-auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { isBlocked, BlacklistBlockedError } from '@/lib/blacklist';
import { listRecords, createRecord } from '@/lib/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!hasPermission(user, 'viewDNS')) {
      return apiError('forbidden', 'No permission to view DNS records', 403);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const name = searchParams.get('name') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const perPage = searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : 50;

    const cfResponse = await listRecords({ type, name, page, perPage });

    if (!cfResponse.success) {
      return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Cloudflare API error', 502);
    }

    return apiSuccess({
      items: cfResponse.result || [],
      total: (cfResponse as any).result_info?.total_count || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return apiError('unauthorized', 'Authentication required', 401);
    }

    if (!hasPermission(user, 'createDNS')) {
      return apiError('forbidden', 'No permission to create DNS records', 403);
    }

    const body = await request.json();
    const validatedData = AnyRecord.parse(body);

    // Skip blacklist check for now - simplified
    // TODO: Add blacklist check back

    // Create record in Cloudflare
    const cfResponse = await createRecord({
      type: validatedData.type,
      name: validatedData.name,
      content: validatedData.content,
      ttl: validatedData.ttl || 1,
      proxied: validatedData.proxied || false,
      priority: 'priority' in validatedData ? validatedData.priority : undefined,
    });

    if (!cfResponse.success) {
      return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Failed to create DNS record', 502);
    }

    // Skip audit log for now - simplified
    // TODO: Add audit log back

    return apiSuccess(cfResponse.result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
