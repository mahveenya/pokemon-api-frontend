import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import Pokemons from './Pokemons';
import { pokemons } from '../../test-utils/fixtures';
import type { Pokemon } from '~/types/pokemon.types';

vi.mock('./Pokemon/Pokemon.tsx', () => ({
  default: (pokemon: Pokemon) => (
    <div data-testid="pokemon">{pokemon.name}</div>
  ),
}));

vi.mock('../NothingToShow/NothingToShow.tsx', () => ({
  default: () => <div data-testid="nothing-to-show">No pokemons</div>,
}));

vi.mock('../ErrorTrigger/ErrorTrigger.tsx', () => ({
  default: () => <div data-testid="error-trigger" />,
}));

test.each([
  { case: 'one pokemon', pokemons: [pokemons[0]] },
  {
    case: 'two pokemons',
    pokemons,
  },
])('should render $case', ({ pokemons }) => {
  render(
    <Pokemons
      pokemons={pokemons}
      error={null}
      onDelete={vi.fn()}
      onUpdate={vi.fn()}
    />
  );

  const pokemonElements = screen.getAllByTestId('pokemon');
  expect(pokemonElements).toHaveLength(pokemons.length);
  expect(screen.queryByTestId('nothing-to-show')).not.toBeInTheDocument();
});

test('should render NothingToShow when no pokemons', () => {
  render(
    <Pokemons
      pokemons={[]}
      error={null}
      onDelete={vi.fn()}
      onUpdate={vi.fn()}
    />
  );

  expect(screen.getByTestId('nothing-to-show')).toBeInTheDocument();
  expect(screen.queryByTestId('pokemon')).not.toBeInTheDocument();
});

test.each([
  { case: 'pokemons are displayed', pokemons },
  {
    case: 'NothingToShow is displayed',
    pokemons: [],
  },
])('should render ErrorTrigger component when $case', ({ pokemons }) => {
  render(
    <Pokemons
      pokemons={pokemons}
      error={null}
      onDelete={vi.fn()}
      onUpdate={vi.fn()}
    />
  );
  expect(screen.getByTestId('error-trigger')).toBeInTheDocument();
});

test('should throw error when error prop is provided', () => {
  const error = new Error('Test error');

  expect(() =>
    render(
      <Pokemons
        pokemons={[]}
        error={error}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
      />
    )
  ).toThrowError(error);
  expect(screen.queryByTestId('error-trigger')).not.toBeInTheDocument();
  expect(screen.queryByTestId('nothing-to-show')).not.toBeInTheDocument();
  expect(screen.queryByTestId('pokemon')).not.toBeInTheDocument();
});
