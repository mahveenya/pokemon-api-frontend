import { Component } from 'react';
import styles from './ConfirmDialog.module.css';
import Modal from '~components/Modal/Modal';

interface Props {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default class ConfirmDialog extends Component<Props> {
  render() {
    const {
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      busy = false,
      busyLabel = 'Working...',
      onConfirm,
      onCancel,
    } = this.props;

    return (
      <Modal
        onClose={onCancel}
        labelledBy="confirm-dialog-message"
        dialogClassName={styles.dialog}
      >
        <p id="confirm-dialog-message" className={styles.message}>
          {message}
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </Modal>
    );
  }
}
