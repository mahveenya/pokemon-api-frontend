import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import App from '~/App';
import api from '~/api/api';

vi.mock('./components/ErrorBoundary/ErrorBoundary.tsx', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock('./components/Loader/Loader.tsx', () => {
  return {
    default: () => <div>Loader</div>,
  };
});

vi.mock('./components/Pokemons/Pokemons.tsx', () => {
  return {
    default: ({ error }: { error: Error | null }) => (
      <div data-testid="pokemons">
        {error ? `ERROR: ${error.message}` : 'Pokemons'}
      </div>
    ),
  };
});

vi.mock('./components/SearchBar/SearchBar.tsx', () => {
  return {
    default: () => <div data-testid="search-bar">SearchBar</div>,
  };
});

test('should render Loader when loading is true', () => {
  render(<App />);
  const loaderElement = screen.getByText('Loader');

  expect(loaderElement).toBeInTheDocument();
});

test.each<{ case: string; methodName: keyof typeof api }>([
  { case: 'getPokemons', methodName: 'getPokemons' },
  { case: 'getPokemon', methodName: 'getPokemon' },
])('should render ErrorBoundary when $case throws', async ({ methodName }) => {
  if (methodName === 'getPokemon') {
    localStorage.setItem('lastSearch', 'pikachu');
  }

  vi.spyOn(api, methodName).mockRejectedValueOnce(new Error('error'));

  render(<App />);

  const pokemons = await screen.findByTestId('pokemons');
  const searchBar = screen.getByTestId('search-bar');

  expect(pokemons).toHaveTextContent('ERROR: error');
  expect(searchBar).toBeInTheDocument();
});

test('sould call api.getPokemons on initial render', () => {
  localStorage.clear();
  const spy = vi.spyOn(api, 'getPokemons');
  render(<App />);

  expect(api.getPokemons).toHaveBeenCalledTimes(1);

  spy.mockRestore();
});

test('should call api.getPokemon with last search from localStorage', () => {
  localStorage.clear();
  localStorage.setItem('lastSearch', 'pikachu');
  const spy = vi.spyOn(api, 'getPokemon');
  render(<App />);

  expect(api.getPokemon).toHaveBeenCalledWith('pikachu');
  expect(api.getPokemon).toHaveBeenCalledTimes(1);

  spy.mockRestore();
});
