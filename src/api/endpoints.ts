const API_BASE = 'https://pokeapi.co/api/v2';

export const API = {
  POKEMON: (nameOrId: string | number) => `${API_BASE}/pokemon/${nameOrId}`,
  POKEMON_LIST: (limit: number, offset: number) =>
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
  POKEMON_ABILITY: (nameOrId: string | number) =>
    `${API_BASE}/ability/${nameOrId}`,
};
