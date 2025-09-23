const BASE_URL = 'https://api.cloudflare.com/client/v4';

function getEnvVars() {
  const CF_API_TOKEN = process.env.CF_API_TOKEN;
  const CF_ZONE_ID = process.env.CF_ZONE_ID;
  const CF_ZONE_NAME = process.env.CF_ZONE_NAME;

  // Skip validation during build time
  if (process.env.NODE_ENV === 'production' && !CF_API_TOKEN) {
    return { 
      CF_API_TOKEN: 'dummy', 
      CF_ZONE_ID: 'dummy', 
      CF_ZONE_NAME: 'dummy' 
    };
  }

  if (!CF_API_TOKEN) {
    throw new Error('CF_API_TOKEN is required');
  }

  if (!CF_ZONE_ID && !CF_ZONE_NAME) {
    throw new Error('Either CF_ZONE_ID or CF_ZONE_NAME is required');
  }

  return { CF_API_TOKEN, CF_ZONE_ID, CF_ZONE_NAME };
}

let cachedZoneId: string | null = null;

export interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  created_on: string;
  modified_on: string;
  priority?: number;
  data?: any;
}

export interface CloudflareResponse<T = any> {
  success: boolean;
  result: T;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface ListRecordsParams {
  type?: string;
  name?: string;
  page?: number;
  perPage?: number;
}

async function getZoneId(): Promise<string> {
  if (cachedZoneId) return cachedZoneId;
  
  const { CF_API_TOKEN, CF_ZONE_ID, CF_ZONE_NAME } = getEnvVars();
  
  if (CF_ZONE_ID) {
    cachedZoneId = CF_ZONE_ID;
    return CF_ZONE_ID;
  }

  if (!CF_ZONE_NAME) {
    throw new Error('Zone ID or Zone Name is required');
  }

  const response = await fetch(`${BASE_URL}/zones?name=${encodeURIComponent(CF_ZONE_NAME)}`, {
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const data: CloudflareResponse<CloudflareRecord[]> = await response.json();
  
  if (!data.success || !data.result?.[0]?.id) {
    throw new Error(`Failed to lookup zone: ${data.errors?.[0]?.message || 'Unknown error'}`);
  }

  cachedZoneId = data.result[0].id;
  return cachedZoneId;
}

export async function listRecords(params: ListRecordsParams = {}): Promise<CloudflareResponse<CloudflareRecord[]>> {
  const { CF_API_TOKEN } = getEnvVars();
  const zoneId = await getZoneId();
  const searchParams = new URLSearchParams();
  
  if (params.type) searchParams.set('type', params.type);
  if (params.name) searchParams.set('name', params.name);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.perPage) searchParams.set('per_page', String(params.perPage));

  const response = await fetch(`${BASE_URL}/zones/${zoneId}/dns_records?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

export async function createRecord(record: Omit<CloudflareRecord, 'id' | 'created_on' | 'modified_on'>): Promise<CloudflareResponse<CloudflareRecord>> {
  const { CF_API_TOKEN } = getEnvVars();
  const zoneId = await getZoneId();
  
  const response = await fetch(`${BASE_URL}/zones/${zoneId}/dns_records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  return response.json();
}

export async function updateRecord(id: string, record: Partial<Omit<CloudflareRecord, 'id' | 'created_on' | 'modified_on'>>): Promise<CloudflareResponse<CloudflareRecord>> {
  const { CF_API_TOKEN } = getEnvVars();
  const zoneId = await getZoneId();
  
  const response = await fetch(`${BASE_URL}/zones/${zoneId}/dns_records/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  return response.json();
}

export async function deleteRecord(id: string): Promise<CloudflareResponse<{ id: string }>> {
  const { CF_API_TOKEN } = getEnvVars();
  const zoneId = await getZoneId();
  
  const response = await fetch(`${BASE_URL}/zones/${zoneId}/dns_records/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

// Error mapping helpers
export function mapCloudflareError(error: any): { code: string; message: string } {
  if (error.errors?.[0]) {
    const cfError = error.errors[0];
    return {
      code: 'cf_api_error',
      message: cfError.message || 'Cloudflare API error',
    };
  }

  return {
    code: 'cf_api_error',
    message: 'Unknown Cloudflare API error',
  };
}
