import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import AbilityPicker from './AbilityPicker';
import api from '~/api/api';
import { abilities } from '~/test-utils/fixtures';
import type { Ability } from '~/types/ability.types';

const newAbility: Ability = {
  id: 99,
  name: 'static',
  effect_entries: [],
};

function setup({ selected = [] as Ability[] } = {}) {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<AbilityPicker selected={selected} onChange={onChange} />);

  return { user, onChange };
}

const getSearchInput = () => screen.getByPlaceholderText('Search abilities');

afterEach(() => {
  vi.restoreAllMocks();
});

test('should search abilities as the user types and render the results', async () => {
  const spy = vi.spyOn(api, 'searchAbilities').mockResolvedValue(abilities);
  const { user } = setup();

  await user.type(getSearchInput(), 'bla');

  expect(
    await screen.findByRole('button', { name: 'blaze' })
  ).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith('bla');
});

test('should add an ability to the selection when a result is clicked', async () => {
  vi.spyOn(api, 'searchAbilities').mockResolvedValue(abilities);
  const { user, onChange } = setup();

  await user.type(getSearchInput(), 'bla');
  await user.click(await screen.findByRole('button', { name: 'blaze' }));

  expect(onChange).toHaveBeenCalledWith([abilities[0]]);
});

test('should not offer an already-selected ability in the results', async () => {
  vi.spyOn(api, 'searchAbilities').mockResolvedValue(abilities);
  const { user } = setup({ selected: [abilities[0]] });

  await user.type(getSearchInput(), 'a');

  expect(
    await screen.findByRole('button', { name: 'solar-power' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'blaze' })
  ).not.toBeInTheDocument();
});

test('should render selected abilities as chips and remove on click', async () => {
  const { user, onChange } = setup({ selected: [abilities[0]] });

  await user.click(screen.getByRole('button', { name: /remove blaze/i }));

  expect(onChange).toHaveBeenCalledWith([]);
});

test('should show a message when no abilities match', async () => {
  vi.spyOn(api, 'searchAbilities').mockResolvedValue([]);
  const { user } = setup();

  await user.type(getSearchInput(), 'zzz');

  expect(await screen.findByText(/no abilities found/i)).toBeInTheDocument();
});

test('should create a new ability and add it to the selection', async () => {
  const spy = vi.spyOn(api, 'createAbility').mockResolvedValue(newAbility);
  const { user, onChange } = setup();

  await user.click(screen.getByRole('button', { name: /create new ability/i }));
  await user.type(
    screen.getByPlaceholderText('New ability name'),
    newAbility.name
  );
  await user.type(
    screen.getByPlaceholderText('New ability short effect'),
    'Paralyzes on contact'
  );
  await user.click(screen.getByRole('button', { name: /^create ability$/i }));

  expect(spy).toHaveBeenCalledWith({
    name: 'static',
    effect_entries: [
      {
        effect: null,
        short_effect: 'Paralyzes on contact',
        language: { name: 'en' },
      },
    ],
  });
  await vi.waitFor(() =>
    expect(onChange).toHaveBeenCalledWith([newAbility])
  );
});

test('should not create an ability when required fields are missing', async () => {
  const spy = vi.spyOn(api, 'createAbility');
  const { user } = setup();

  await user.click(screen.getByRole('button', { name: /create new ability/i }));
  await user.click(screen.getByRole('button', { name: /^create ability$/i }));

  expect(spy).not.toHaveBeenCalled();
  expect(
    screen.getByText(/ability name and short effect are required/i)
  ).toBeInTheDocument();
});
