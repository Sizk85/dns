import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { blacklist } from '@/db/schema';
import { PartialRecord } from '@/lib/validation/dns';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { apiSuccess, apiError, handleApiError, withAuth } from '@/lib/api';
import { createAuditLog, AuditActions, AuditTargetTypes } from '@/lib/audit';
import { isBlocked, BlacklistBlockedError } from '@/lib/blacklist';
import { updateRecord, deleteRecord } from '@/lib/cloudflare';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'editDNS')) {
      return apiError('forbidden', 'No permission to edit DNS records', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = PartialRecord.parse(body);

    // If updating name or content, check blacklist
    if (validatedData.name || validatedData.content) {
      const blacklistRules = await db.select().from(blacklist);
      const blockResult = isBlocked(
        {
          type: validatedData.type || 'A', // Default to A for validation
          name: validatedData.name || '',
          content: validatedData.content || '',
        },
        blacklistRules.map(rule => ({
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
    }

    // Update record in Cloudflare
    const cfResponse = await updateRecord(id, validatedData);

    if (!cfResponse.success) {
      return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Failed to update DNS record', 502);
    }

    // Create audit log
    await createAuditLog(user, {
      action: AuditActions.DNS_UPDATE,
      target_type: AuditTargetTypes.DNS_RECORD,
      target_id: id,
      metadata: {
        changes: validatedData,
        cloudflare_response: cfResponse.result,
      },
    });

    return apiSuccess(cfResponse.result);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    if (!hasPermission(user, 'deleteDNS')) {
      return apiError('forbidden', 'No permission to delete DNS records', 403);
    }

    const { id } = await params;

    // Delete record from Cloudflare
    const cfResponse = await deleteRecord(id);

    if (!cfResponse.success) {
      return apiError('cf_api_error', cfResponse.errors?.[0]?.message || 'Failed to delete DNS record', 502);
    }

    // Create audit log
    await createAuditLog(user, {
      action: AuditActions.DNS_DELETE,
      target_type: AuditTargetTypes.DNS_RECORD,
      target_id: id,
      metadata: {
        cloudflare_response: cfResponse.result,
      },
    });

    return apiSuccess({ id, deleted: true });
  });
}
