import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import ls from '../../db/storage';

test('should render the search input and a search button', () => {
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  expect(searchInput).toBeInTheDocument();
  expect(searchButton).toBeInTheDocument();
});

test('should call onSearch when the search button is clicked', async () => {
  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'pikachu');
  await user.click(searchButton);

  expect(handleSearch).toHaveBeenCalledWith('pikachu');
  expect(handleSearch).toHaveBeenCalledTimes(1);
});

test('should trim query before calling onSearch', async () => {
  localStorage.clear();

  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, '   pikachu   ');
  await user.click(searchButton);

  expect(handleSearch).toHaveBeenCalledWith('pikachu');
  expect(handleSearch).toHaveBeenCalledTimes(1);
});

test('should set last search in localStorage when query is not empty', async () => {
  localStorage.clear();

  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const spy = vi.spyOn(ls, 'setLastSearch');

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, 'pikachu');
  await user.click(searchButton);

  expect(ls.setLastSearch).toHaveBeenCalledWith('pikachu');
  expect(ls.setLastSearch).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('lastSearch')).toBe('pikachu');

  spy.mockRestore();
});

test('should trim and set last search in localStorage when query has leading/trailing spaces', async () => {
  localStorage.clear();

  const spy = vi.spyOn(ls, 'setLastSearch');

  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.type(searchInput, '   pikachu   ');
  await user.click(searchButton);

  expect(ls.setLastSearch).toHaveBeenCalledWith('pikachu');
  expect(ls.setLastSearch).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('lastSearch')).toBe('pikachu');

  spy.mockRestore();
});

test('should remove last search from localStorage when query is empty', async () => {
  localStorage.setItem('lastSearch', 'to-be-removed');

  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  const searchInput = screen.getByRole('searchbox');
  const searchButton = screen.getByRole('button', { name: /search/i });

  await user.clear(searchInput);
  await user.click(searchButton);

  expect(localStorage.getItem('lastSearch')).toBeNull();
});
