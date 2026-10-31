import { Component, inject, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PortalApi } from '../../../core/portal-api.service';

/** Orientação reutilizada quando uma área terminou de carregar sem registros. */
@Component({
  selector: 'app-empty-state',
  imports: [NzIconModule],
  template: `@if (!api.pending() && !api.error()) {
    <div class="empty-state">
      <nz-icon [nzType]="icon()" aria-hidden="true" />
      <div>
        <h3>{{ heading() }}</h3>
        <p>{{ description() }}</p>
        <ng-content />
      </div>
    </div>
  }`,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .empty-state {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: var(--radius-control);
      background: var(--color-paper);
      color: var(--color-muted);
    }
    nz-icon {
      flex: 0 0 24px;
      margin-top: 2px;
      color: var(--color-muted);
      font-size: 24px;
    }
    div > div {
      min-width: 0;
    }
    h3 {
      margin: 0 0 4px;
      color: var(--color-text);
      font: 500 16px/24px var(--font-body);
    }
    p {
      max-width: 65ch;
      margin: 0;
      font: 400 15px/22px var(--font-body);
      overflow-wrap: anywhere;
    }
  `,
})
export class EmptyState {
  readonly api = inject(PortalApi);
  readonly icon = input('file-text');
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
}
