import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import SearchInput from './SearchInput';

function setup() {
  localStorage.clear();
  const user = userEvent.setup();
  return { user };
}

test('should render the search input with query from localStorage', () => {
  setup();
  localStorage.setItem('lastSearch', 'bulbasaur');
  render(<SearchInput />);

  const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
  expect(searchInput).toBeInTheDocument();
  expect(searchInput.value).toBe('bulbasaur');
});

test('should show placeholder text', () => {
  setup();
  render(<SearchInput />);

  const searchInput = screen.getByRole('searchbox');
  expect(searchInput).toHaveAttribute(
    'placeholder',
    'Search pokemons by name or id...'
  );
});

test('should update input value when typing', async () => {
  const { user } = setup();
  render(<SearchInput />);

  const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
  expect(searchInput.value).toBe('');

  await user.type(searchInput, 'charmander');
  expect(searchInput.value).toBe('charmander');
});
