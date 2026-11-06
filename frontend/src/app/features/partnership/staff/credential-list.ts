import { Component, input } from '@angular/core';
import { reportBenefitLabel } from '../shared/report-format';
import type { Credential } from './staff-preview.service';

@Component({
  selector: 'app-credential-list',
  styleUrl: './credential-list.css',
  template: `
    <ul class="credential-list">
      @for (item of credentials(); track $index) {
        <li class="credential-row">
          <dl class="credential-quantity">
            <dt>Quantidade</dt>
            <dd>{{ item.quantidade }}</dd>
          </dl>
          <dl class="credential-details">
            <div>
              <dt>Tipo</dt>
              <dd>{{ benefitLabel(item.tipo) }}</dd>
            </div>
            <div>
              <dt>Setor</dt>
              <dd>{{ item.setor }}</dd>
            </div>
            <div>
              <dt>Público</dt>
              <dd>{{ item.publico }}</dd>
            </div>
          </dl>
        </li>
      } @empty {
        <li class="credentials-empty">Nenhuma credencial informada para esta parceria.</li>
      }
    </ul>
  `,
})
export class CredentialList {
  readonly credentials = input.required<readonly Credential[]>();
  readonly benefitLabel = reportBenefitLabel;
}
