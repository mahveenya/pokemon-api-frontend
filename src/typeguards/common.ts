import type { NamedAPIResource, Language } from '~/types/common.types';

export function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isNamedAPIResource(obj: unknown): obj is NamedAPIResource {
  return (
    isRecord(obj) && typeof obj.name === 'string' && typeof obj.url === 'string'
  );
}

export function isNamedAPIResourceArray(
  obj: unknown
): obj is NamedAPIResource[] {
  return Array.isArray(obj) && obj.every(isNamedAPIResource);
}

export function isLanguage(obj: unknown): obj is Language {
  return isRecord(obj) && typeof obj.name === 'string';
}
