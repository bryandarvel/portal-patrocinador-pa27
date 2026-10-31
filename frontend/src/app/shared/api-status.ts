import { Component, inject } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PortalApi } from '../core/portal-api.service';

@Component({
  selector: 'app-api-status',
  imports: [NzSpinModule],
  template: `
    @if (api.pending()) {
      <div role="status" class="api-loading">
        <nz-spin nzSimple nzSize="small" aria-hidden="true" /><span
          >Aguarde, atualizando os dados…</span
        >
      </div>
    }
    @if (api.error()) {
      <div role="alert" class="api-error">
        <p>{{ api.error() }}</p>
        <button type="button" (click)="api.error.set('')" aria-label="Fechar mensagem de erro">
          Fechar
        </button>
      </div>
    }
    @if (api.notice()) {
      <p role="status" class="api-notice">{{ api.notice() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .api-loading,
    .api-notice {
      margin: 0;
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-control);
      background: var(--color-surface);
      color: var(--color-muted);
    }
    .api-loading {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .api-notice {
      border-color: var(--color-success);
      background: var(--color-success-soft);
      color: var(--color-success);
    }
    .api-error {
      padding: 12px 16px;
      background: var(--color-error-soft);
      color: var(--color-error);
      border: 1px solid var(--color-error);
      border-radius: var(--radius-control);
      margin: 12px 0;
    }
    .api-error p {
      margin: 0 0 8px;
    }
    .api-error button {
      font: inherit;
      border: 1px solid currentColor;
      border-radius: 999px;
      background: white;
      color: inherit;
      min-height: 36px;
      padding: 4px 12px;
      cursor: pointer;
    }
    .api-error button:hover {
      background: var(--color-error-soft);
    }
    .api-error button:focus-visible {
      outline: 2px solid var(--color-focus);
      outline-offset: 3px;
    }
  `,
})
export class ApiStatus {
  readonly api = inject(PortalApi);
}
