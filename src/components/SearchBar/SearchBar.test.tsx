import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import ls from '../../db/storage';

function setup() {
  localStorage.clear();

  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  return { user, handleSearch, searchInput, searchButton };
}

test('should render input and button', () => {
  const { searchInput, searchButton } = setup();

  expect(searchInput).toBeInTheDocument();
  expect(searchButton).toBeInTheDocument();
});

test('should call onSearch when button is clicked', async () => {
  const { user, handleSearch, searchInput, searchButton } = setup();
  await user.type(searchInput, 'pikachu');
  await user.click(searchButton);

  expect(handleSearch).toHaveBeenCalledWith('pikachu');
  expect(handleSearch).toHaveBeenCalledTimes(1);
});

test('should trim query before calling onSearch', async () => {
  const { user, handleSearch, searchInput, searchButton } = setup();
  await user.type(searchInput, '   pikachu   ');
  await user.click(searchButton);

  expect(handleSearch).toHaveBeenCalledWith('pikachu');
  expect(handleSearch).toHaveBeenCalledTimes(1);
});

test('should set query in localStorage', async () => {
  const { user, searchInput, searchButton } = setup();
  const spy = vi.spyOn(ls, 'setLastSearch');
  await user.type(searchInput, 'pikachu');
  await user.click(searchButton);

  expect(ls.setLastSearch).toHaveBeenCalledWith('pikachu');
  expect(ls.setLastSearch).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('lastSearch')).toBe('pikachu');

  spy.mockRestore();
});

test('should trim query before saving to localStorage', async () => {
  const { user, searchInput, searchButton } = setup();
  const spy = vi.spyOn(ls, 'setLastSearch');
  await user.type(searchInput, '   pikachu   ');
  await user.click(searchButton);

  expect(ls.setLastSearch).toHaveBeenCalledWith('pikachu');
  expect(ls.setLastSearch).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('lastSearch')).toBe('pikachu');

  spy.mockRestore();
});

test('should remove query from localStorage when called with empty query', async () => {
  const { user, searchInput, searchButton } = setup();
  localStorage.setItem('lastSearch', 'to-be-removed');
  await user.clear(searchInput);
  await user.click(searchButton);

  expect(localStorage.getItem('lastSearch')).toBeNull();
});

test('should call onSearch when Enter key is pressed', async () => {
  const { user, handleSearch, searchInput } = setup();

  await user.type(searchInput, 'squirtle{Enter}');

  expect(handleSearch).toHaveBeenCalledWith('squirtle');
  expect(handleSearch).toHaveBeenCalledTimes(1);
});

// searchbar
// should call api.getPokemon when query is non-empty
// should call api.getPokemons when query is empty
// should not show loader when fetchData is in progress

// pokemons
// should render Pokemons when loading state is false
// should render Loader when fetchData is in progress

// pokemon
// should render Pokemon when loading state is false
// should render Loader when fetchData is in progress

// should handle errors when fetchData fails
// should handle unexpected errors in fetchData
// should pass pokemons and error props to Pokemons component
// should render ErrorBoundary around Pokemons component when fetchData fails
