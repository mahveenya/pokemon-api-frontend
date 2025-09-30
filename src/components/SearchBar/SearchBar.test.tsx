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

test('should render the search input and a search button', () => {
  const { searchInput, searchButton } = setup();

  expect(searchInput).toBeInTheDocument();
  expect(searchButton).toBeInTheDocument();
});

test('should call onSearch when the search button is clicked', async () => {
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

test('should set last search in localStorage when query is not empty', async () => {
  const { user, searchInput, searchButton } = setup();
  const spy = vi.spyOn(ls, 'setLastSearch');
  await user.type(searchInput, 'pikachu');
  await user.click(searchButton);

  expect(ls.setLastSearch).toHaveBeenCalledWith('pikachu');
  expect(ls.setLastSearch).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('lastSearch')).toBe('pikachu');

  spy.mockRestore();
});

test('should trim and set last search in localStorage when query has leading/trailing spaces', async () => {
  const { user, searchInput, searchButton } = setup();
  const spy = vi.spyOn(ls, 'setLastSearch');
  await user.type(searchInput, '   pikachu   ');
  await user.click(searchButton);

  expect(ls.setLastSearch).toHaveBeenCalledWith('pikachu');
  expect(ls.setLastSearch).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('lastSearch')).toBe('pikachu');

  spy.mockRestore();
});

test('should remove last search from localStorage when query is empty', async () => {
  const { user, searchInput, searchButton } = setup();
  localStorage.setItem('lastSearch', 'to-be-removed');
  await user.clear(searchInput);
  await user.click(searchButton);

  expect(localStorage.getItem('lastSearch')).toBeNull();
});
