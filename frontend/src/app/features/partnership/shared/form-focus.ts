/** Conduz ao formulário inserido na página, sem animação nem alteração dos dados. */
export function focusFormSection(section: HTMLElement): void {
  section.scrollIntoView({ block: 'start', behavior: 'instant' });
  section.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true });
}
