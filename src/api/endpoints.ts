const API_BASE: string = import.meta.env.VITE_API_BASE;

export const API = {
  POKEMON: (nameOrId: string | number) => `${API_BASE}/pokemon/${nameOrId}`,
  POKEMON_CREATE: () => `${API_BASE}/pokemon`,
  POKEMON_LIST: (limit: number, offset: number) =>
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
  POKEMON_ABILITY: (nameOrId: string | number) =>
    `${API_BASE}/ability/${nameOrId}`,
};
