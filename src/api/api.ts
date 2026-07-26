import { API } from './endpoints';
import { FetchError } from './customErrors';
import { newRequestId, REQUEST_ID_HEADER } from '~/utils/requestId';
import { isAbility, isAbilityListResponse } from '~/typeguards/ability';
import { isPokemonListResponse, isPokemon } from '~/typeguards/pokemon';
import type { Typeguard } from '~/types/helper.types';
import type {
  AbilityInfo,
  Ability,
  AbilityCreate,
} from '~/types/ability.types';
import type { NamedAPIResource } from '~/types/common.types';
import type {
  PokemonListResponse,
  Pokemon,
  PokemonCreate,
  PokemonUpdate,
} from '~/types/pokemon.types';

class Api {
  private async makeRequest(request: Request) {
    try {
      request.headers.set(REQUEST_ID_HEADER, newRequestId());
      const response = await fetch(request);

      if (response.status >= 400) {
        const parsedResponse = await this.safeParseJson(response);
        throw new FetchError('Request failed', {
          response: parsedResponse,
          request,
        });
      }

      if (response.status === 204) {
        return null;
      }

      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      if (error instanceof FetchError) {
        throw error;
      }

      throw new Error('Unexpected error during fetch', { cause: error });
    }
  }

  private async getPokemonListResponse(
    limit: number = 20,
    offset: number = 0,
    search?: string
  ): Promise<PokemonListResponse> {
    return this.get(
      API.POKEMON_LIST(limit, offset, search),
      isPokemonListResponse
    );
  }

  async getPokemon(nameOrId: string): Promise<Pokemon> {
    if (!nameOrId) throw new Error('Provide pokemon name or id');
    return await this.get(API.POKEMON(nameOrId), isPokemon);
  }

  async createPokemon(payload: PokemonCreate): Promise<Pokemon> {
    return await this.post(API.POKEMON_CREATE(), payload, isPokemon);
  }

  async updatePokemon(
    id: string | number,
    payload: PokemonUpdate
  ): Promise<Pokemon> {
    if (!id) throw new Error('Provide pokemon id');
    return await this.patch(API.POKEMON(id), payload, isPokemon);
  }

  async deletePokemon(nameOrId: string | number): Promise<void> {
    if (!nameOrId) throw new Error('Provide pokemon name or id');
    await this.delete(API.POKEMON(nameOrId));
  }

  async getPokemons(): Promise<Pokemon[]> {
    const pokemonAPIResource = (await this.getPokemonListResponse()).results;
    return await this.loadUrls(pokemonAPIResource, isPokemon);
  }

  async searchPokemons(search: string): Promise<Pokemon[]> {
    const pokemonAPIResource = (
      await this.getPokemonListResponse(20, 0, search)
    ).results;
    return await this.loadUrls(pokemonAPIResource, isPokemon);
  }

  async searchAbilities(search: string): Promise<Ability[]> {
    const abilityAPIResource = (
      await this.get(API.ABILITY_LIST(search, 20, 0), isAbilityListResponse)
    ).results;
    return await this.loadUrls(abilityAPIResource, isAbility);
  }

  async createAbility(payload: AbilityCreate): Promise<Ability> {
    return await this.post(API.ABILITY_CREATE(), payload, isAbility);
  }

  async getAbilities(abilities: AbilityInfo[]): Promise<Ability[]> {
    const abilityAPIResource = abilities.map(
      (abilityInfo: AbilityInfo) => abilityInfo.ability
    );
    return await this.loadUrls(abilityAPIResource, isAbility);
  }

  async loadUrls<T>(apiResource: NamedAPIResource[], Typeguard?: Typeguard<T>) {
    return await Promise.all(
      apiResource.map(({ url }) => this.get(url, Typeguard))
    );
  }

  private async get<T>(endpoint: string, Typeguard?: Typeguard<T>): Promise<T> {
    const url = new URL(endpoint, window.location.origin);
    const request = new Request(url);
    const response = await this.makeRequest(request);

    if (Typeguard && !Typeguard(response)) {
      throw new Error(
        `Invalid response shape of response object for ${endpoint}`
      );
    }

    return response;
  }

  private async post<T>(
    endpoint: string,
    body: unknown,
    Typeguard?: Typeguard<T>
  ): Promise<T> {
    const url = new URL(endpoint, window.location.origin);
    const request = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const response = await this.makeRequest(request);

    if (Typeguard && !Typeguard(response)) {
      throw new Error(
        `Invalid response shape of response object for ${endpoint}`
      );
    }

    return response;
  }

  private async patch<T>(
    endpoint: string,
    body: unknown,
    Typeguard?: Typeguard<T>
  ): Promise<T> {
    const url = new URL(endpoint, window.location.origin);
    const request = new Request(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const response = await this.makeRequest(request);

    if (Typeguard && !Typeguard(response)) {
      throw new Error(
        `Invalid response shape of response object for ${endpoint}`
      );
    }

    return response;
  }

  private async delete(endpoint: string): Promise<void> {
    const url = new URL(endpoint, window.location.origin);
    const request = new Request(url, { method: 'DELETE' });
    await this.makeRequest(request);
  }

  private async safeParseJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}

export default new Api();
