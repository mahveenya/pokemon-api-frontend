import type { NamedAPIResource } from './common.types';
import type { Effect } from './effect.types';

export interface AbilityInfo {
  ability: NamedAPIResource;
}

export interface Ability {
  id: number;
  name: string;
  effect_entries: Effect[];
}
