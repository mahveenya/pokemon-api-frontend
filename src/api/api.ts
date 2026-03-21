import { API } from './endpoints';
import { FetchError } from './customErrors';
import { isAbility } from '~/typeguards/ability';
import { isPokemonListResponse, isPokemon } from '~/typeguards/pokemon';
import type { Typeguard } from '~/types/helper.types';
import type { AbilityInfo, Ability } from '~/types/ability.types';
import type { NamedAPIResource } from '~/types/common.types';
import type { PokemonListResponse, Pokemon } from '~/types/pokemon.types';

class Api {
  private async makeRequest(request: Request) {
    try {
      const response = await fetch(request);

      if (response.status >= 400) {
        const parsedResponse = await this.safeParseJson(response);
        throw new FetchError('Request failed', {
          response: parsedResponse,
          request,
        });
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
    offset: number = 0
  ): Promise<PokemonListResponse> {
    return this.get(API.POKEMON_LIST(limit, offset), isPokemonListResponse);
  }

  async getPokemon(nameOrId: string): Promise<Pokemon> {
    if (!nameOrId) throw new Error('Provide pokemon name or id');
    return await this.get(API.POKEMON(nameOrId), isPokemon);
  }

  async getPokemons(): Promise<Pokemon[]> {
    const pokemonAPIResource = (await this.getPokemonListResponse()).results;
    return await this.loadUrls(pokemonAPIResource, isPokemon);
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
    const url = new URL(`${endpoint}`);
    const request = new Request(url);
    const response = await this.makeRequest(request);

    if (Typeguard && !Typeguard(response)) {
      throw new Error(
        `Invalid response shape of response object for ${endpoint}`
      );
    }

    return response;
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
