import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { FetchError } from '~/api/customErrors';

function ThrowNormalError() {
  throw new Error('Normal error happened');
  return <></>;
}

function ThrowFetchError() {
  const request = new Request('https://api.test/pokemons', { method: 'GET' });
  const response = new Response(null, { status: 404 });
  throw new FetchError('Fetch failed', { request, response });
  return <></>;
}

test('renders normal error message when a non-FetchError is thrown', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <ErrorBoundary>
      <ThrowNormalError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/ooops, something went wrong/i)).toBeInTheDocument();
  expect(screen.getByText(/normal error happened/i)).toBeInTheDocument();
});

test('renders FetchError details when FetchError is thrown', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <ErrorBoundary>
      <ThrowFetchError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/ooops, something went wrong/i)).toBeInTheDocument();

  expect(screen.getByText(/GET/i)).toBeInTheDocument();
  expect(
    screen.getByText(/https:\/\/api\.test\/pokemons/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/404/i)).toBeInTheDocument();
  screen.debug();
});
