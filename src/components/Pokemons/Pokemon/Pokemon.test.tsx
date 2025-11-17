import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { pokemons } from '~/test-utils/fixtures';
import Pokemon from './Pokemon';
import api from '~/api/api';
import type { Ability } from '~/types/types';

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

test('should display pokemon name and abilities', async () => {
  render(<Pokemon pokemon={pokemons[0]} />);
  const nameElement = screen.getByText(pokemons[0].name);
  const abilitiesElement = await screen.findByTestId('pokemon-abilities');

  expect(abilitiesElement).toBeInTheDocument();
  expect(nameElement).toBeInTheDocument();
});

test('should call getAbilities on mount', async () => {
  const apiSpy = vi.spyOn(api, 'getAbilities');

  render(<Pokemon pokemon={pokemons[0]} />);

  expect(apiSpy).toHaveBeenCalledTimes(1);
  expect(apiSpy).toHaveBeenCalledWith(pokemons[0].abilities);
});

test('should display loader while abilities are loading', () => {
  render(<Pokemon pokemon={pokemons[0]} />);
  const loaderElement = screen.getByTestId('loader');

  expect(loaderElement).toBeInTheDocument();
});

test('should handle errors during abilities loading', async () => {
  const pokemonInstance = new Pokemon({ pokemon: pokemons[0] });
  pokemonInstance.setState = vi.fn();
  vi.spyOn(api, 'getAbilities').mockRejectedValueOnce(
    new Error('Failed to load abilities')
  );

  await expect(pokemonInstance.loadAbilities()).rejects.toThrow(
    'Failed to load abilities'
  );
});

test('should handle unknown errors during abilities loading', async () => {
  const pokemonInstance = new Pokemon({ pokemon: pokemons[0] });
  pokemonInstance.setState = vi.fn();
  const unknownError = { message: 'Some error' };
  vi.spyOn(api, 'getAbilities').mockRejectedValueOnce(unknownError);

  await expect(pokemonInstance.loadAbilities()).rejects.toThrow(
    'Unknown error occurred'
  );
});
