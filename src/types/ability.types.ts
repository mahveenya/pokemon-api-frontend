import type { NamedAPIResource } from './common.types';
import type { Effect, EffectCreate } from './effect.types';

export interface AbilityInfo {
  ability: NamedAPIResource;
}

export interface Ability {
  id: number;
  name: string;
  effect_entries: Effect[];
}

export interface AbilityCreate {
  name: string;
  effect_entries: EffectCreate[];
}
