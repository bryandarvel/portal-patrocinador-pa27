import { Component, inject } from '@angular/core';
import { PortalApi } from '../core/portal-api.service';

@Component({
  selector: 'app-api-status',
  template: `
    @if (api.pending()) {
      <p role="status" aria-live="polite" class="api-loading">Aguarde, atualizando os dados…</p>
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
      padding: 12px 16px;
      background: #f4f4f4;
      border-radius: 8px;
    }
    .api-error {
      padding: 12px 16px;
      background: #fff0ed;
      color: #8c2216;
      border: 1px solid #b42318;
      border-radius: 8px;
      margin: 12px 0;
    }
    .api-error p {
      margin: 0 0 8px;
    }
    .api-error button {
      font: inherit;
      border: 1px solid currentColor;
      border-radius: 4px;
      background: white;
      color: inherit;
      min-height: 36px;
      padding: 4px 12px;
      cursor: pointer;
    }
  `,
})
export class ApiStatus {
  readonly api = inject(PortalApi);
}
