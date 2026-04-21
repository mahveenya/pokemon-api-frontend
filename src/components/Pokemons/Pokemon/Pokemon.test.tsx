import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { pokemons, abilities } from '~/test-utils/fixtures';
import Pokemon from './Pokemon';
import api from '~/api/api';
import type { Ability } from '~/types/ability.types';

vi.mock('./PokemonAbilities/PokemonAbilities.tsx', () => ({
  default: ({ abilities }: { abilities: Ability[] }) => (
    <div data-testid="pokemon-abilities">
      {abilities.map((ability) => (
        <div key={ability.id}>ability name</div>
      ))}
    </div>
  ),
}));

vi.mock('../../Loader/Loader.tsx', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

beforeEach(() => {
  vi.spyOn(api, 'getAbilities').mockResolvedValue(abilities);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('should display pokemon name and abilities', async () => {
  render(<Pokemon pokemon={pokemons[0]} />);
  const nameElement = screen.getByText(pokemons[0].name);
  const abilitiesElement = await screen.findByTestId('pokemon-abilities');

  expect(abilitiesElement).toBeInTheDocument();
  expect(nameElement).toBeInTheDocument();
});

test('should call getAbilities on mount', () => {
  render(<Pokemon pokemon={pokemons[0]} />);

  expect(api.getAbilities).toHaveBeenCalledTimes(1);
  expect(api.getAbilities).toHaveBeenCalledWith(pokemons[0].abilities);
});

test('should display loader while abilities are loading', () => {
  render(<Pokemon pokemon={pokemons[0]} />);
  const loaderElement = screen.getByTestId('loader');

  expect(loaderElement).toBeInTheDocument();
});

test('should handle errors during abilities loading', async () => {
  vi.spyOn(api, 'getAbilities').mockRejectedValueOnce(
    new Error('Failed to load abilities')
  );
  const pokemonInstance = new Pokemon({ pokemon: pokemons[0] });
  pokemonInstance.setState = vi.fn();

  await expect(pokemonInstance.loadAbilities()).rejects.toThrow(
    'Failed to load abilities'
  );
});

test('should handle unknown errors during abilities loading', async () => {
  vi.spyOn(api, 'getAbilities').mockRejectedValueOnce({
    message: 'Some error',
  });
  const pokemonInstance = new Pokemon({ pokemon: pokemons[0] });
  pokemonInstance.setState = vi.fn();

  await expect(pokemonInstance.loadAbilities()).rejects.toThrow(
    'Unknown error occurred'
  );
});
