import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import EditPokemon from './EditPokemon';
import api from '~/api/api';
import { pokemons, abilities } from '~/test-utils/fixtures';
import type { Ability } from '~/types/ability.types';
import type { Pokemon } from '~/types/pokemon.types';

const pokemon = pokemons[0];
const updatedPokemon: Pokemon = { ...pokemon, name: 'raichu' };

vi.mock('~components/AbilityPicker/AbilityPicker', () => ({
  default: ({
    selected,
    onChange,
  }: {
    selected: Ability[];
    onChange: (next: Ability[]) => void;
  }) => (
    <div data-testid="ability-picker">
      <span data-testid="selected-count">{selected.length}</span>
      <button type="button" onClick={() => onChange([])}>
        clear-abilities
      </button>
    </div>
  ),
}));

const getNameInput = () => screen.getByPlaceholderText('Pokemon name');
const getSaveButton = () => screen.getByRole('button', { name: /^save$/i });

function setup() {
  const user = userEvent.setup();
  const onUpdated = vi.fn();
  const onClose = vi.fn();
  render(
    <EditPokemon
      pokemon={pokemon}
      initialAbilities={[abilities[0]]}
      onUpdated={onUpdated}
      onClose={onClose}
    />
  );

  return { user, onUpdated, onClose };
}

afterEach(() => {
  vi.restoreAllMocks();
});

test('should preload the pokemon name and current abilities', () => {
  setup();

  expect(getNameInput()).toHaveValue(pokemon.name);
  expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
});

test('should update the pokemon and notify the parent with the new abilities', async () => {
  const spy = vi.spyOn(api, 'updatePokemon').mockResolvedValue(updatedPokemon);
  const { user, onUpdated } = setup();

  await user.clear(getNameInput());
  await user.type(getNameInput(), 'raichu');
  await user.click(getSaveButton());

  expect(spy).toHaveBeenCalledWith(pokemon.id, {
    name: 'raichu',
    ability_ids: [abilities[0].id],
  });
  expect(onUpdated).toHaveBeenCalledWith(updatedPokemon, [abilities[0]]);
});

test('should close when cancel is clicked', async () => {
  const { user, onClose } = setup();

  await user.click(screen.getByRole('button', { name: /cancel/i }));

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('should close when the overlay is clicked', async () => {
  const { user, onClose } = setup();

  const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
  await user.click(overlay);

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('should not update when name or abilities are missing', async () => {
  const spy = vi.spyOn(api, 'updatePokemon');
  const { user, onUpdated } = setup();

  await user.click(screen.getByRole('button', { name: /clear-abilities/i }));
  await user.click(getSaveButton());

  expect(spy).not.toHaveBeenCalled();
  expect(onUpdated).not.toHaveBeenCalled();
  expect(
    screen.getByText(/name and at least one ability are required/i)
  ).toBeInTheDocument();
});

test('should show an error message when the update fails', async () => {
  vi.spyOn(api, 'updatePokemon').mockRejectedValue(
    new Error('Pokemon already exists')
  );
  const { user, onUpdated } = setup();

  await user.click(getSaveButton());

  expect(await screen.findByText('Pokemon already exists')).toBeInTheDocument();
  expect(onUpdated).not.toHaveBeenCalled();
});
