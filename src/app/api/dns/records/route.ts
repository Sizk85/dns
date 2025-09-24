import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { blacklist } from '@/db/schema';
import { AnyRecord } from '@/lib/validation/dns';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError, withAuth } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';
import { isBlocked, BlacklistBlockedError } from '@/lib/blacklist';
import { listRecords, createRecord } from '@/lib/cloudflare';

export async function GET(request: NextRequest) {
  return withAuth(async (user) => {
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
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'createDNS')) {
      return apiError('forbidden', 'No permission to create DNS records', 403);
    }

    const body = await request.json();
    const validatedData = AnyRecord.parse(body);

    // Check blacklist
    const blacklistRules = await db.select().from(blacklist);
    const blockResult = isBlocked(
      {
        type: validatedData.type,
        name: validatedData.name,
        content: validatedData.content,
      },
      blacklistRules.map((rule: any) => ({
        id: rule.id,
        field: rule.field as 'name' | 'content' | 'both',
        pattern: rule.pattern,
        is_regex: rule.is_regex,
        type: rule.type as any,
        description: rule.description || undefined,
      }))
    );

    if (blockResult.blocked) {
      throw new BlacklistBlockedError(blockResult.rule!, 
        `Record blocked by blacklist rule: ${blockResult.rule!.pattern}`
      );
    }

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

    // Create audit log
    await createAuditLog(user, {
      action: AuditActions.DNS_CREATE,
      target_type: AuditTargetTypes.DNS_RECORD,
      target_id: cfResponse.result.id,
      metadata: {
        record: validatedData,
        cloudflare_response: cfResponse.result,
      },
    });

    return apiSuccess(cfResponse.result, 201);
  });
}
