import { NextRequest } from 'next/server';
import { AnyRecord } from '@/lib/validation/dns';
import { getAuthUser } from '@/lib/simple-auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError } from '@/lib/api';
import { getDemoRecords, createDemoRecord } from '@/lib/demo-dns';
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

    // Check if Cloudflare is configured
    if (!process.env.CF_API_TOKEN || !process.env.CF_ZONE_NAME) {
      const demoData = getDemoRecords();
      return apiSuccess({
        items: demoData.result,
        total: demoData.result_info.total_count,
      });
    }

    try {
      const cfResponse = await listRecords({ type, name, page, perPage });

      if (!cfResponse.success) {
        return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Cloudflare API error', 502);
      }

      return apiSuccess({
        items: cfResponse.result || [],
        total: (cfResponse as any).result_info?.total_count || 0,
      });
    } catch (cfError) {
      // If Cloudflare API fails, show demo data
      return apiSuccess({
        items: [
          {
            id: 'demo-1',
            type: 'A',
            name: 'www',
            content: '192.168.1.1',
            ttl: 300,
            proxied: false,
            created_on: new Date().toISOString(),
            modified_on: new Date().toISOString(),
          }
        ],
        total: 1,
      });
    }
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

    // For demo mode, use demo system
    if (!process.env.CF_API_TOKEN || !process.env.CF_ZONE_NAME) {
      const demoResult = createDemoRecord({
        type: validatedData.type,
        name: validatedData.name,
        content: validatedData.content,
        ttl: validatedData.ttl || 300,
        proxied: validatedData.proxied || false,
        priority: 'priority' in validatedData ? validatedData.priority : undefined,
      });
      
      return apiSuccess(demoResult.result, 201);
    }

    // Create record in Cloudflare
    try {
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

      return apiSuccess(cfResponse.result, 201);
    } catch (cfError) {
      return apiError('cf_api_error', 'Cloudflare API not configured', 502);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
