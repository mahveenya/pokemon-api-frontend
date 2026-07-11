import type { AbilityInfo } from './ability.types';
import type { NamedAPIResource } from './common.types';

export interface Pokemon {
  id: number;
  name: string;
  abilities: AbilityInfo[];
}

export interface PokemonCreate {
  name: string;
  ability_ids: number[];
}

export interface PokemonUpdate {
  name?: string;
  ability_ids?: number[];
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}
