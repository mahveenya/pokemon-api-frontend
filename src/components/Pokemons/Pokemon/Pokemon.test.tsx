import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
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

vi.mock('~components/EditPokemon/EditPokemon', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="edit-pokemon">
      <button type="button" onClick={onClose}>
        close-edit
      </button>
    </div>
  ),
}));

function setup() {
  const user = userEvent.setup();
  const onDelete = vi.fn();
  const onUpdate = vi.fn();
  render(
    <Pokemon pokemon={pokemons[0]} onDelete={onDelete} onUpdate={onUpdate} />
  );

  return { user, onDelete, onUpdate };
}

const getDeleteButton = () =>
  screen.getByRole('button', { name: `Delete ${pokemons[0].name}` });

beforeEach(() => {
  vi.spyOn(api, 'getAbilities').mockResolvedValue(abilities);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('should display pokemon name and abilities', async () => {
  setup();
  const nameElement = screen.getByText(pokemons[0].name);
  const abilitiesElement = await screen.findByTestId('pokemon-abilities');

  expect(abilitiesElement).toBeInTheDocument();
  expect(nameElement).toBeInTheDocument();
});

test('should call getAbilities on mount', () => {
  setup();

  expect(api.getAbilities).toHaveBeenCalledTimes(1);
  expect(api.getAbilities).toHaveBeenCalledWith(pokemons[0].abilities);
});

test('should display loader while abilities are loading', () => {
  setup();
  const loaderElement = screen.getByTestId('loader');

  expect(loaderElement).toBeInTheDocument();
});

test('should handle errors during abilities loading', async () => {
  vi.spyOn(api, 'getAbilities').mockRejectedValueOnce(
    new Error('Failed to load abilities')
  );
  const pokemonInstance = new Pokemon({
    pokemon: pokemons[0],
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
  });
  pokemonInstance.setState = vi.fn();

  await expect(pokemonInstance.loadAbilities()).rejects.toThrow(
    'Failed to load abilities'
  );
});

test('should handle unknown errors during abilities loading', async () => {
  vi.spyOn(api, 'getAbilities').mockRejectedValueOnce({
    message: 'Some error',
  });
  const pokemonInstance = new Pokemon({
    pokemon: pokemons[0],
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
  });
  pokemonInstance.setState = vi.fn();

  await expect(pokemonInstance.loadAbilities()).rejects.toThrow(
    'Unknown error occurred'
  );
});

test('should open the edit dialog once abilities have loaded', async () => {
  const { user } = setup();

  const editButton = await screen.findByRole('button', { name: /^edit /i });
  await user.click(editButton);

  expect(screen.getByTestId('edit-pokemon')).toBeInTheDocument();
});

const getConfirmButton = () =>
  screen.getByRole('button', { name: /^delete$/i });

test('should ask for confirmation before deleting', async () => {
  const spy = vi.spyOn(api, 'deletePokemon').mockResolvedValue();
  const { user } = setup();

  await user.click(getDeleteButton());

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(spy).not.toHaveBeenCalled();
});

test('should delete the pokemon and notify the parent when confirmed', async () => {
  const spy = vi.spyOn(api, 'deletePokemon').mockResolvedValue();
  const { user, onDelete } = setup();

  await user.click(getDeleteButton());
  await user.click(getConfirmButton());

  expect(spy).toHaveBeenCalledWith(pokemons[0].id);
  expect(onDelete).toHaveBeenCalledWith(pokemons[0].id);
});

test('should not delete when the confirmation is cancelled', async () => {
  const spy = vi.spyOn(api, 'deletePokemon').mockResolvedValue();
  const { user, onDelete } = setup();

  await user.click(getDeleteButton());
  await user.click(screen.getByRole('button', { name: /cancel/i }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(spy).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
});

test('should disable the confirm button and show progress while deleting', async () => {
  let resolveDelete!: () => void;
  vi.spyOn(api, 'deletePokemon').mockReturnValue(
    new Promise<void>((resolve) => {
      resolveDelete = resolve;
    })
  );
  const { user, onDelete } = setup();

  await user.click(getDeleteButton());
  await user.click(getConfirmButton());

  const deleting = screen.getByRole('button', { name: /deleting/i });
  expect(deleting).toBeDisabled();
  expect(onDelete).not.toHaveBeenCalled();

  resolveDelete();
  await vi.waitFor(() => expect(onDelete).toHaveBeenCalledWith(pokemons[0].id));
});

test('should not notify the parent when delete fails', async () => {
  vi.spyOn(api, 'deletePokemon').mockRejectedValueOnce(
    new Error('Failed to delete')
  );
  const onDelete = vi.fn();
  const pokemonInstance = new Pokemon({
    pokemon: pokemons[0],
    onDelete,
    onUpdate: vi.fn(),
  });
  pokemonInstance.setState = vi.fn();

  await expect(pokemonInstance.handleDelete()).rejects.toThrow(
    'Failed to delete'
  );
  expect(onDelete).not.toHaveBeenCalled();
});
