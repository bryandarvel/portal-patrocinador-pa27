import { NzModalComponent } from 'ng-zorro-antd/modal';

/** Adapta o modal à API de acessibilidade disponível no NG-ZORRO instalado. */
export function labelPartnershipDialog(modal: NzModalComponent, titleId: string): void {
  // Sem animação, afterOpen dispara antes da atribuição da referência do modal.
  queueMicrotask(() => {
    const container = modal.getElement()?.closest<HTMLElement>('[role="dialog"]');
    if (!container) return;
    container.setAttribute('aria-labelledby', titleId);
    container.setAttribute('aria-modal', 'true');
    container.querySelector('.ant-modal-close')?.setAttribute('aria-label', 'Fechar diálogo');
  });
}
