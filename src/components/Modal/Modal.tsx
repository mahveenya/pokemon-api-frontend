import { Component, createRef } from 'react';
import type { ReactNode } from 'react';
import styles from './Modal.module.css';

interface Props {
  onClose: () => void;
  labelledBy?: string;
  dialogClassName?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default class Modal extends Component<Props> {
  private dialogRef = createRef<HTMLDivElement>();

  private previouslyFocused: HTMLElement | null = null;

  componentDidMount() {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', this.handleKeyDown);
    this.focusFirst();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.previouslyFocused?.focus?.();
  }

  private getFocusable = (): HTMLElement[] => {
    const dialog = this.dialogRef.current;
    if (!dialog) return [];
    return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
  };

  private focusFirst = () => {
    const focusable = this.getFocusable();
    (focusable[0] ?? this.dialogRef.current)?.focus();
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.props.onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = this.getFocusable();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private stopPropagation = (event: React.MouseEvent) =>
    event.stopPropagation();

  render() {
    const { onClose, labelledBy, dialogClassName, children } = this.props;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div
          ref={this.dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={`${styles.dialog} ${dialogClassName ?? ''}`}
          onClick={this.stopPropagation}
        >
          {children}
        </div>
      </div>
    );
  }
}
