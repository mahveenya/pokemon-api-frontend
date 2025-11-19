import ErrorTrigger from './ErrorTrigger';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

test('should throw error when ErrorTrigger is clicked', async () => {
  const user = userEvent.setup();

  render(
    <ErrorBoundary>
      <ErrorTrigger />
    </ErrorBoundary>
  );

  const button = screen.getByRole('button', { name: /trigger error/i });
  await user.click(button);
  const fallback = await screen.findByText(/simulated error/i);

  expect(fallback).toBeInTheDocument();
});
