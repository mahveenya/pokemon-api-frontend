import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

function setup(
  props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}
) {
  const user = userEvent.setup();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      message="Delete Bulbasaur?"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );

  return { user, onConfirm, onCancel };
}

test('should render the message and default action labels', () => {
  setup();

  expect(screen.getByText('Delete Bulbasaur?')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
});

test('should call onConfirm and onCancel when the buttons are clicked', async () => {
  const { user, onConfirm, onCancel } = setup();

  await user.click(screen.getByRole('button', { name: /confirm/i }));
  await user.click(screen.getByRole('button', { name: /cancel/i }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenCalledTimes(1);
});

test('should disable the buttons and show the busy label while busy', () => {
  setup({ busy: true, busyLabel: 'Deleting...', confirmLabel: 'Delete' });

  const confirm = screen.getByRole('button', { name: /deleting/i });
  expect(confirm).toBeDisabled();
  expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
});

test('should close when the overlay is clicked', async () => {
  const { user, onCancel } = setup();

  const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
  await user.click(overlay);

  expect(onCancel).toHaveBeenCalledTimes(1);
});
