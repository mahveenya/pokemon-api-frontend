const API_BASE: string = import.meta.env.VITE_API_BASE;

export const API = {
  POKEMON: (nameOrId: string | number) => `${API_BASE}/pokemon/${nameOrId}`,
  POKEMON_CREATE: () => `${API_BASE}/pokemon`,
  POKEMON_LIST: (limit: number, offset: number, search?: string) => {
    const base = `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
    return search ? `${base}&search=${encodeURIComponent(search)}` : base;
  },
  ABILITY: (id: string | number) => `${API_BASE}/ability/${id}`,
  ABILITY_CREATE: () => `${API_BASE}/ability`,
  ABILITY_LIST: (search: string, limit: number, offset: number) =>
    `${API_BASE}/ability?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`,
};
