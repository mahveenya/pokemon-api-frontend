import type { Pokemon, PokemonListResponse } from '~/types/pokemon.types';
import { isRecord, isNamedAPIResourceArray } from './common';
import { isAbilityInfoArray } from './ability';

export function isPokemon(obj: unknown): obj is Pokemon {
  return (
    isRecord(obj) &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    isAbilityInfoArray(obj.abilities)
  );
}

export function isPokemonListResponse(
  obj: unknown
): obj is PokemonListResponse {
  return (
    isRecord(obj) &&
    typeof obj.count === 'number' &&
    (typeof obj.next === 'string' || obj.next === null) &&
    (typeof obj.previous === 'string' || obj.previous === null) &&
    isNamedAPIResourceArray(obj.results)
  );
}
