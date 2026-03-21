import type { AbilityInfo, Ability } from '~/types/ability.types';
import { isRecord, isNamedAPIResource } from './common';
import { isEffectArray } from './effect';

export function isAbilityInfo(obj: unknown): obj is AbilityInfo {
  return isRecord(obj) && isNamedAPIResource(obj.ability);
}

export function isAbilityInfoArray(obj: unknown): obj is AbilityInfo[] {
  return Array.isArray(obj) && obj.every(isAbilityInfo);
}

export function isAbility(obj: unknown): obj is Ability {
  return (
    isRecord(obj) &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    isEffectArray(obj.effect_entries)
  );
}
