import { Component, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { formatReportDate, reportBenefitLabel } from '../shared/report-format';
import type { CourtesyPreview } from './tickets-preview.service';

@Component({
  selector: 'app-courtesy-card',
  imports: [NzIconModule],
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './courtesy-card.css'],
  template: `
    <article class="pa-card courtesy-card" [attr.aria-labelledby]="'courtesy-' + item().id">
      <header class="courtesy-heading">
        <span class="document-icon" aria-hidden="true"><nz-icon nzType="gift" /></span>
        <div>
          <h3 [id]="'courtesy-' + item().id">{{ benefitLabel(item().type) }}</h3>
          <p>{{ item().sector }}</p>
        </div>
      </header>
      <dl class="courtesy-balance">
        <div>
          <dt>Quantidade total</dt>
          <dd>{{ item().quantity }}</dd>
        </div>
        <div>
          <dt>Saldo disponível</dt>
          <dd>{{ item().quantity - item().allocated }}</dd>
        </div>
      </dl>
      @if (item().periodStart) {
        <p class="courtesy-period">
          <nz-icon nzType="calendar" aria-hidden="true" />
          <strong>Período</strong> {{ formatDate(item().periodStart, true) }} a
          {{ formatDate(item().periodEnd, true) }}
        </p>
      }
      @if (item().eventDay) {
        <p class="courtesy-period">
          <nz-icon nzType="calendar" aria-hidden="true" />
          <strong>Dia</strong> {{ formatDate(item().eventDay, true) }}
        </p>
      }
      @if (item().destinations.length) {
        <div class="courtesy-destinations">
          <h4>Destinações</h4>
          <ul>
            @for (destination of item().destinations; track destination.id) {
              <li>
                <span>{{ destination.destinacao }}</span>
                <strong>{{ destination.quantidade }}</strong>
              </li>
            }
          </ul>
        </div>
      }
      <footer class="courtesy-footer"><ng-content /></footer>
    </article>
  `,
})
export class CourtesyCard {
  readonly item = input.required<CourtesyPreview>();
  readonly benefitLabel = reportBenefitLabel;
  readonly formatDate = formatReportDate;
}
