import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import AddPokemon from './AddPokemon';
import api from '~/api/api';
import { pokemons } from '~/test-utils/fixtures';
import type { Pokemon } from '~/types/pokemon.types';

const createdPokemon = pokemons[0];

const getNameInput = () => screen.getByPlaceholderText('Pokemon name');
const getAbilityNameInput = () => screen.getByPlaceholderText('Ability name');
const getShortEffectInput = () =>
  screen.getByPlaceholderText('Ability short effect');
const getEffectInput = () =>
  screen.getByPlaceholderText('Ability effect (optional)');
const getSubmitButton = () => screen.getByRole('button', { name: /^add$/i });

async function setup({ open = true } = {}) {
  const user = userEvent.setup();
  const onCreated = vi.fn();
  render(<AddPokemon onCreated={onCreated} />);

  if (open) {
    await user.click(screen.getByRole('button', { name: /add pokemon/i }));
  }

  return { user, onCreated };
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  {
    name = 'pikachu',
    abilityName = 'static',
    shortEffect = 'May paralyze on contact',
    effect = '',
  } = {}
) {
  if (name) await user.type(getNameInput(), name);
  if (abilityName) await user.type(getAbilityNameInput(), abilityName);
  if (shortEffect) await user.type(getShortEffectInput(), shortEffect);
  if (effect) await user.type(getEffectInput(), effect);
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

test('should show the dialog with all form fields when the trigger is clicked', async () => {
  await setup();

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(getNameInput()).toBeInTheDocument();
  expect(getAbilityNameInput()).toBeInTheDocument();
  expect(getShortEffectInput()).toBeInTheDocument();
  expect(getEffectInput()).toBeInTheDocument();
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

test('should create a pokemon with the built payload and notify the parent', async () => {
  const spy = vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user, onCreated } = await setup();

  await fillForm(user);
  await user.click(getSubmitButton());

  expect(spy).toHaveBeenCalledWith({
    name: 'pikachu',
    abilities: [
      {
        name: 'static',
        effect_entries: [
          {
            effect: null,
            short_effect: 'May paralyze on contact',
            language: { name: 'en' },
          },
        ],
      },
    ],
  });
  expect(onCreated).toHaveBeenCalledWith(createdPokemon);
});

test('should close the dialog after a successful create', async () => {
  vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user } = await setup();

  await fillForm(user);
  await user.click(getSubmitButton());

  expect(
    await screen.findByRole('button', { name: /add pokemon/i })
  ).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test.each([
  { field: 'name', overrides: { name: '' } },
  { field: 'ability name', overrides: { abilityName: '' } },
  { field: 'short effect', overrides: { shortEffect: '' } },
  { field: 'name (whitespace only)', overrides: { name: '   ' } },
  {
    field: 'ability name (whitespace only)',
    overrides: { abilityName: '   ' },
  },
  {
    field: 'short effect (whitespace only)',
    overrides: { shortEffect: '   ' },
  },
])(
  'should not create a pokemon when the required $field is missing',
  async ({ overrides }) => {
    const spy = vi.spyOn(api, 'createPokemon');
    const { user, onCreated } = await setup();

    await fillForm(user, overrides);
    await user.click(getSubmitButton());

    expect(spy).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(
      screen.getByText(/name, ability name and short effect are required/i)
    ).toBeInTheDocument();
  }
);

test('should send every field in the payload when all are filled', async () => {
  const spy = vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user } = await setup();

  await fillForm(user, { effect: 'Paralyzes the target on contact' });
  await user.click(getSubmitButton());

  expect(spy).toHaveBeenCalledWith({
    name: 'pikachu',
    abilities: [
      {
        name: 'static',
        effect_entries: [
          {
            effect: 'Paralyzes the target on contact',
            short_effect: 'May paralyze on contact',
            language: { name: 'en' },
          },
        ],
      },
    ],
  });
});

test('should reset the form fields after a successful create', async () => {
  vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user } = await setup();

  await fillForm(user, { effect: 'Paralyzes the target on contact' });
  await user.click(getSubmitButton());

  await user.click(await screen.findByRole('button', { name: /add pokemon/i }));

  expect(getNameInput()).toHaveValue('');
  expect(getAbilityNameInput()).toHaveValue('');
  expect(getShortEffectInput()).toHaveValue('');
  expect(getEffectInput()).toHaveValue('');
});

test('should trim whitespace from every field before building the payload', async () => {
  const spy = vi.spyOn(api, 'createPokemon').mockResolvedValue(createdPokemon);
  const { user } = await setup();

  await fillForm(user, {
    name: '  pikachu  ',
    abilityName: '  static  ',
    shortEffect: '  May paralyze on contact  ',
    effect: '  Paralyzes the target on contact  ',
  });
  await user.click(getSubmitButton());

  expect(spy).toHaveBeenCalledWith({
    name: 'pikachu',
    abilities: [
      {
        name: 'static',
        effect_entries: [
          {
            effect: 'Paralyzes the target on contact',
            short_effect: 'May paralyze on contact',
            language: { name: 'en' },
          },
        ],
      },
    ],
  });
});

test('should disable the submit button and show progress while submitting', async () => {
  let resolveCreate!: (pokemon: Pokemon) => void;
  vi.spyOn(api, 'createPokemon').mockReturnValue(
    new Promise<Pokemon>((resolve) => {
      resolveCreate = resolve;
    })
  );
  const { user } = await setup();

  await fillForm(user);
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

  await fillForm(user);
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

  await fillForm(user);
  await user.click(getSubmitButton());

  expect(await screen.findByText('Pokemon already exists')).toBeInTheDocument();
  expect(onCreated).not.toHaveBeenCalled();
});
