import type { Effect } from '~/types/effect.types';
import { isRecord, isLanguage } from './common';

export function isEffect(obj: unknown): obj is Effect {
  return (
    isRecord(obj) &&
    (typeof obj.effect === 'string' || obj.effect === null) &&
    typeof obj.short_effect === 'string' &&
    isLanguage(obj.language)
  );
}

export function isEffectArray(obj: unknown): obj is Effect[] {
  return Array.isArray(obj) && obj.every(isEffect);
}
