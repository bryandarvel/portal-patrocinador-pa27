import { Component, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

/** Faixa de disponibilidade de envio; a ação do Admin RBS entra por projeção. */
@Component({
  selector: 'app-submission-status',
  imports: [NzIconModule],
  template: `
    <section class="status" [class.is-closed]="!open()" aria-label="Disponibilidade de envio">
      <span class="status-icon" aria-hidden="true"
        ><nz-icon [nzType]="open() ? 'send' : 'lock'"
      /></span>
      <div class="copy" role="status">
        <p class="title">{{ open() ? 'Envio de materiais aberto' : 'Envio encerrado pela RBS' }}</p>
        <p>
          {{
            open()
              ? 'Os materiais podem ser enviados ou substituídos.'
              : 'A equipe RBS pode reabrir o envio para correção.'
          }}
        </p>
      </div>
      <div class="actions"><ng-content /></div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 20px 28px 20px 24px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      background: linear-gradient(90deg, #f4fbf8, var(--color-surface) 55%);
      box-shadow: var(--shadow-card);
    }
    .is-closed {
      background: linear-gradient(90deg, #fff6f5, var(--color-surface) 55%);
    }
    .status-icon {
      flex: 0 0 64px;
      height: 64px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--color-success-soft);
      color: var(--color-success);
      font-size: 28px;
    }
    .is-closed .status-icon {
      background: var(--color-error-soft);
      color: var(--color-error);
    }
    .copy {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    p {
      margin: 0;
      color: var(--color-muted);
      font-size: 16px;
      line-height: 24px;
    }
    .title {
      color: var(--color-success);
      font-size: 19px;
      line-height: 26px;
      font-weight: 700;
    }
    .is-closed .title {
      color: var(--color-error);
    }
    .actions:empty {
      display: none;
    }
    @media (max-width: 760px) {
      .status {
        flex-wrap: wrap;
        gap: 16px;
        padding: 16px;
      }
      .status-icon {
        flex-basis: 48px;
        height: 48px;
        font-size: 22px;
      }
      .copy {
        flex-basis: calc(100% - 64px);
      }
    }
  `,
})
export class SubmissionStatus {
  readonly open = input.required<boolean>();
}
