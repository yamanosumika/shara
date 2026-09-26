export type IdPrefix = 'doc' | 'node' | 'edge' | 'group' | 'rule' | 'question';

export function createId(prefix: IdPrefix): string {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '_')}`;
}

export function createDeterministicId(prefix: IdPrefix, suffix: string): string {
  return `${prefix}_${suffix.replace(/[^A-Za-z0-9_-]/g, '_')}`;
}
