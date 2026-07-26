import api from './api';
import { FetchError } from './customErrors';
import { pokemons, abilities } from '~/test-utils/fixtures';
import type { AbilityInfo } from '~/types/ability.types';

const pokemon = pokemons[0];
const ability = abilities[0];

const namedResource = (name: string) => ({
  name,
  url: `/api/v1/pokemon/${name}`,
});

const listResponse = (results: { name: string; url: string }[]) => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

const jsonResponse = (status: number, data: unknown) => ({
  status,
  json: async () => data,
});

function mockFetch() {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('getPokemon resolves the parsed pokemon', async () => {
  mockFetch().mockResolvedValue(jsonResponse(200, pokemon));

  await expect(api.getPokemon('1')).resolves.toEqual(pokemon);
});

test('getPokemon rejects when no id is provided', async () => {
  await expect(api.getPokemon('')).rejects.toThrow(
    'Provide pokemon name or id'
  );
});

test('createPokemon posts the payload and returns the pokemon', async () => {
  const fetchMock = mockFetch().mockResolvedValue(jsonResponse(201, pokemon));

  await expect(
    api.createPokemon({ name: 'pikachu', ability_ids: [1] })
  ).resolves.toEqual(pokemon);
  expect(fetchMock.mock.calls[0][0].method).toBe('POST');
});

test('updatePokemon patches the payload and returns the pokemon', async () => {
  const fetchMock = mockFetch().mockResolvedValue(jsonResponse(200, pokemon));

  await expect(
    api.updatePokemon(1, { name: 'raichu', ability_ids: [2] })
  ).resolves.toEqual(pokemon);
  expect(fetchMock.mock.calls[0][0].method).toBe('PATCH');
});

test('deletePokemon issues a DELETE and resolves on 204', async () => {
  const fetchMock = mockFetch().mockResolvedValue(jsonResponse(204, null));

  await expect(api.deletePokemon(1)).resolves.toBeUndefined();
  expect(fetchMock.mock.calls[0][0].method).toBe('DELETE');
});

test('getPokemons fetches the list then loads each pokemon', async () => {
  mockFetch()
    .mockResolvedValueOnce(
      jsonResponse(200, listResponse([namedResource('1')]))
    )
    .mockResolvedValueOnce(jsonResponse(200, pokemon));

  await expect(api.getPokemons()).resolves.toEqual([pokemon]);
});

test('searchPokemons passes the term and loads the matches', async () => {
  const fetchMock = mockFetch()
    .mockResolvedValueOnce(
      jsonResponse(200, listResponse([namedResource('1')]))
    )
    .mockResolvedValueOnce(jsonResponse(200, pokemon));

  await expect(api.searchPokemons('pik')).resolves.toEqual([pokemon]);
  expect(fetchMock.mock.calls[0][0].url).toContain('search=pik');
});

test('searchAbilities loads the matching abilities', async () => {
  mockFetch()
    .mockResolvedValueOnce(
      jsonResponse(200, listResponse([namedResource('blaze')]))
    )
    .mockResolvedValueOnce(jsonResponse(200, ability));

  await expect(api.searchAbilities('bla')).resolves.toEqual([ability]);
});

test('createAbility posts the payload and returns the ability', async () => {
  const fetchMock = mockFetch().mockResolvedValue(jsonResponse(201, ability));

  await expect(
    api.createAbility({
      name: 'blaze',
      effect_entries: [
        { effect: null, short_effect: 'x', language: { name: 'en' } },
      ],
    })
  ).resolves.toEqual(ability);
  expect(fetchMock.mock.calls[0][0].method).toBe('POST');
});

test('getAbilities loads each ability referenced by the pokemon', async () => {
  const abilityInfos: AbilityInfo[] = [{ ability: namedResource('blaze') }];
  mockFetch().mockResolvedValue(jsonResponse(200, ability));

  await expect(api.getAbilities(abilityInfos)).resolves.toEqual([ability]);
});

test('a >= 400 response throws a FetchError', async () => {
  mockFetch().mockResolvedValue(jsonResponse(404, { detail: 'not found' }));

  await expect(api.getPokemon('999')).rejects.toBeInstanceOf(FetchError);
});

test('an invalid response shape throws', async () => {
  mockFetch().mockResolvedValue(jsonResponse(200, { not: 'a pokemon' }));

  await expect(api.getPokemon('1')).rejects.toThrow(/Invalid response shape/);
});

test('sends a unique X-Request-ID on every verb without dropping Content-Type', async () => {
  const fetchMock = mockFetch().mockResolvedValue(jsonResponse(200, pokemon));

  await api.getPokemon('1');
  await api.createPokemon({ name: 'pikachu', ability_ids: [1] });
  await api.deletePokemon(1);

  const [getReq, postReq, deleteReq] = [0, 1, 2].map(
    (i) => fetchMock.mock.calls[i][0]
  );

  const ids = [getReq, postReq, deleteReq].map((r) =>
    r.headers.get('X-Request-ID')
  );
  expect(ids.every(Boolean)).toBe(true);
  expect(new Set(ids).size).toBe(3);
  expect(postReq.headers.get('Content-Type')).toBe('application/json');
});
