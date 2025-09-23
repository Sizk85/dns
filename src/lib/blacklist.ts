export interface BlacklistRule {
  id: number;
  field: 'name' | 'content' | 'both';
  pattern: string;
  is_regex: boolean;
  type: 'ANY' | 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'NS';
  description?: string;
}

export interface DNSRecordCheck {
  type: string;
  name: string;
  content: string;
}

export function matchPattern(value: string, pattern: string, isRegex: boolean): boolean {
  try {
    if (isRegex) {
      const regex = new RegExp(pattern, 'i');
      return regex.test(value);
    }
    
    // Convert glob pattern to regex
    // Escape special regex characters except * and ?
    const escaped = pattern
      .replace(/[.+^${}()|\[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${escaped}$`, 'i');
    return regex.test(value);
  } catch {
    // If regex is invalid, treat as literal string match
    return value.toLowerCase().includes(pattern.toLowerCase());
  }
}

export function isBlocked(
  record: DNSRecordCheck,
  rules: BlacklistRule[]
): { blocked: boolean; rule?: BlacklistRule } {
  for (const rule of rules) {
    // Check if rule applies to this record type
    if (rule.type !== 'ANY' && rule.type !== record.type) {
      continue;
    }

    let matches = false;

    switch (rule.field) {
      case 'name':
        matches = matchPattern(record.name, rule.pattern, rule.is_regex);
        break;
      case 'content':
        matches = matchPattern(record.content, rule.pattern, rule.is_regex);
        break;
      case 'both':
        matches = 
          matchPattern(record.name, rule.pattern, rule.is_regex) ||
          matchPattern(record.content, rule.pattern, rule.is_regex);
        break;
    }

    if (matches) {
      return { blocked: true, rule };
    }
  }

  return { blocked: false };
}

export class BlacklistBlockedError extends Error {
  constructor(public rule: BlacklistRule, message?: string) {
    super(message || `Record blocked by blacklist rule: ${rule.pattern}`);
    this.name = 'BlacklistBlockedError';
  }
}
