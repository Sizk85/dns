// Demo DNS records for testing without Cloudflare API

let demoRecords = [
  {
    id: 'demo-1',
    type: 'A',
    name: 'www',
    content: '192.168.1.1',
    ttl: 300,
    proxied: false,
    created_on: new Date().toISOString(),
    modified_on: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    type: 'CNAME',
    name: 'blog',
    content: 'example.com',
    ttl: 300,
    proxied: true,
    created_on: new Date().toISOString(),
    modified_on: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    type: 'MX',
    name: '@',
    content: 'mail.example.com',
    ttl: 3600,
    proxied: false,
    priority: 10,
    created_on: new Date().toISOString(),
    modified_on: new Date().toISOString(),
  }
];

export function getDemoRecords() {
  return {
    success: true,
    result: demoRecords,
    result_info: { total_count: demoRecords.length }
  };
}

export function createDemoRecord(record: any) {
  const newRecord = {
    id: `demo-${Date.now()}`,
    ...record,
    created_on: new Date().toISOString(),
    modified_on: new Date().toISOString(),
  };
  
  demoRecords.push(newRecord);
  
  return {
    success: true,
    result: newRecord
  };
}

export function updateDemoRecord(id: string, updates: any) {
  const index = demoRecords.findIndex(r => r.id === id);
  
  if (index === -1) {
    return {
      success: false,
      errors: [{ message: 'Record not found' }]
    };
  }
  
  demoRecords[index] = {
    ...demoRecords[index],
    ...updates,
    modified_on: new Date().toISOString(),
  };
  
  return {
    success: true,
    result: demoRecords[index]
  };
}

export function deleteDemoRecord(id: string) {
  const index = demoRecords.findIndex(r => r.id === id);
  
  if (index === -1) {
    return {
      success: false,
      errors: [{ message: 'Record not found' }]
    };
  }
  
  const deleted = demoRecords.splice(index, 1)[0];
  
  return {
    success: true,
    result: { id: deleted.id }
  };
}
