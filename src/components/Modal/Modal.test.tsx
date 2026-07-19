import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

function setup() {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <Modal onClose={onClose} labelledBy="modal-title">
      <h2 id="modal-title">Title</h2>
      <button type="button">first</button>
      <button type="button">last</button>
    </Modal>
  );

  return { user, onClose };
}

test('should render an accessible modal dialog labelled by its title', () => {
  setup();

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
});

test('should focus the first focusable element on mount', () => {
  setup();

  expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
});

test('should close when Escape is pressed', async () => {
  const { user, onClose } = setup();

  await user.keyboard('{Escape}');

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('should close when the overlay is clicked but not the dialog', async () => {
  const { user, onClose } = setup();

  await user.click(screen.getByRole('dialog'));
  expect(onClose).not.toHaveBeenCalled();

  const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
  await user.click(overlay);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('should trap focus by wrapping Tab from the last to the first element', async () => {
  const { user } = setup();

  const first = screen.getByRole('button', { name: 'first' });
  const last = screen.getByRole('button', { name: 'last' });

  last.focus();
  await user.tab();

  expect(first).toHaveFocus();
});
