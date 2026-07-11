import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import AddPokemon from './AddPokemon';
import api from '~/api/api';
import { pokemons, abilities } from '~/test-utils/fixtures';
import type { Pokemon } from '~/types/pokemon.types';
import type { Ability } from '~/types/ability.types';

const createdPokemon = pokemons[0];

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
      <button type="button" onClick={() => onChange([abilities[0]])}>
        select-ability
      </button>
    </div>
  ),
}));

const getNameInput = () => screen.getByPlaceholderText('Pokemon name');
const getSubmitButton = () => screen.getByRole('button', { name: /^add$/i });
const selectAbility = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /select-ability/i }));

async function setup({ open = true } = {}) {
  const user = userEvent.setup();
  const onCreated = vi.fn();
  render(<AddPokemon onCreated={onCreated} />);

  if (open) {
    await user.click(screen.getByRole('button', { name: /add pokemon/i }));
  }

  return { user, onCreated };
}

afterEach(() => {
  vi.restoreAllMocks();
});

test('should render only the trigger button and no dialog by default', async () => {
  await setup({ open: false });

  expect(
    screen.getByRole('button', { name: /add pokemon/i })
  ).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByPlaceholderText('Pokemon name')).not.toBeInTheDocument();
});

test('should show the dialog with the name field and ability picker when opened', async () => {
  await setup();

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(getNameInput()).toBeInTheDocument();
  expect(screen.getByTestId('ability-picker')).toBeInTheDocument();
  expect(getSubmitButton()).toBeInTheDocument();
});

test('should close the dialog when cancel is clicked', async () => {
  const { user } = await setup();

  await user.click(screen.getByRole('button', { name: /cancel/i }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('should close the dialog when the overlay is clicked', async () => {
  const { user } = await setup();

  const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
  await user.click(overlay);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('should keep the dialog open when clicking inside it', async () => {
  const { user } = await setup();

  await user.click(screen.getByRole('dialog'));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('should create a pokemon with the selected ability ids and notify the parent', async () => {
  const spy = vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user, onCreated } = await setup();

  await user.type(getNameInput(), 'pikachu');
  await selectAbility(user);
  await user.click(getSubmitButton());

  expect(spy).toHaveBeenCalledWith({
    name: 'pikachu',
    ability_ids: [abilities[0].id],
  });
  expect(onCreated).toHaveBeenCalledWith(createdPokemon);
});

test('should trim the name before building the payload', async () => {
  const spy = vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user } = await setup();

  await user.type(getNameInput(), '  pikachu  ');
  await selectAbility(user);
  await user.click(getSubmitButton());

  expect(spy).toHaveBeenCalledWith({
    name: 'pikachu',
    ability_ids: [abilities[0].id],
  });
});

test('should close the dialog after a successful create', async () => {
  vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user } = await setup();

  await user.type(getNameInput(), 'pikachu');
  await selectAbility(user);
  await user.click(getSubmitButton());

  expect(
    await screen.findByRole('button', { name: /add pokemon/i })
  ).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test.each([
  { field: 'name', name: '', pickAbility: true },
  { field: 'name (whitespace only)', name: '   ', pickAbility: true },
  { field: 'ability', name: 'pikachu', pickAbility: false },
])(
  'should not create a pokemon when the required $field is missing',
  async ({ name, pickAbility }) => {
    const spy = vi.spyOn(api, 'createPokemon');
    const { user, onCreated } = await setup();

    if (name) await user.type(getNameInput(), name);
    if (pickAbility) await selectAbility(user);
    await user.click(getSubmitButton());

    expect(spy).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(
      screen.getByText(/name and at least one ability are required/i)
    ).toBeInTheDocument();
  }
);

test('should disable the submit button and show progress while submitting', async () => {
  let resolveCreate!: (pokemon: Pokemon) => void;
  vi.spyOn(api, 'createPokemon').mockReturnValue(
    new Promise<Pokemon>((resolve) => {
      resolveCreate = resolve;
    })
  );
  const { user } = await setup();

  await user.type(getNameInput(), 'pikachu');
  await selectAbility(user);
  await user.click(getSubmitButton());

  const submitting = screen.getByRole('button', { name: /adding/i });
  expect(submitting).toBeDisabled();

  resolveCreate(createdPokemon);
  await screen.findByRole('button', { name: /add pokemon/i });
});

test('should clear the previous error after a successful retry', async () => {
  vi.spyOn(api, 'createPokemon')
    .mockRejectedValueOnce(new Error('Pokemon already exists'))
    .mockResolvedValueOnce(createdPokemon);
  const { user, onCreated } = await setup();

  await user.type(getNameInput(), 'pikachu');
  await selectAbility(user);
  await user.click(getSubmitButton());
  expect(await screen.findByText('Pokemon already exists')).toBeInTheDocument();

  await user.click(getSubmitButton());

  expect(
    await screen.findByRole('button', { name: /add pokemon/i })
  ).toBeInTheDocument();
  expect(screen.queryByText('Pokemon already exists')).not.toBeInTheDocument();
  expect(onCreated).toHaveBeenCalledWith(createdPokemon);
});

test('should show an error message when the api call fails', async () => {
  vi.spyOn(api, 'createPokemon').mockRejectedValue(
    new Error('Pokemon already exists')
  );
  const { user, onCreated } = await setup();

  await user.type(getNameInput(), 'pikachu');
  await selectAbility(user);
  await user.click(getSubmitButton());

  expect(await screen.findByText('Pokemon already exists')).toBeInTheDocument();
  expect(onCreated).not.toHaveBeenCalled();
});
