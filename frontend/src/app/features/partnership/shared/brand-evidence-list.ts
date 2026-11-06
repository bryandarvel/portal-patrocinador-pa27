import { Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BrandPublication } from './partnership-preview.service';

@Component({
  selector: 'app-brand-evidence-list',
  imports: [NzButtonModule, NzIconModule],
  template: `
    <ul class="evidence-list">
      @for (publication of publications(); track publication.id) {
        <li class="evidence-item">
          <div class="evidence-info">
            <span class="evidence-icon" aria-hidden="true">
              <nz-icon
                [nzType]="publication.url && !publication.arquivoId ? 'link' : 'file-text'"
              />
            </span>
            <div class="evidence-copy">
              <h3>{{ publication.titulo }}</h3>
              @if (publication.texto) {
                <p>{{ publication.texto }}</p>
              }
            </div>
          </div>
          @if (publication.arquivoId || publication.url) {
            <div class="evidence-actions">
              @if (publication.arquivoId; as fileId) {
                <button
                  nz-button
                  class="pill"
                  type="button"
                  [attr.aria-label]="'Baixar arquivo: ' + publication.titulo"
                  (click)="download.emit({ id: fileId, title: publication.titulo })"
                >
                  <nz-icon nzType="download" aria-hidden="true" />Baixar arquivo
                </button>
              }
              @if (publication.url; as url) {
                <a
                  nz-button
                  class="pill"
                  [href]="url"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="
                    'Abrir comprovação: ' + publication.titulo + ' (abre em nova aba)'
                  "
                >
                  <nz-icon nzType="export" aria-hidden="true" />Abrir comprovação
                </a>
              }
            </div>
          }
        </li>
      } @empty {
        <li class="empty-message">Nenhuma publicação de marca disponível.</li>
      }
    </ul>
  `,
  styleUrls: ['./partnership-ui.css'],
  styles: `
    :host {
      width: 100%;
      min-width: 0;
    }
    .evidence-list {
      width: 100%;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    .evidence-item {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 20px;
      padding: 20px 0;
    }
    .evidence-item:first-child {
      padding-top: 0;
    }
    .evidence-item:last-child {
      padding-bottom: 0;
    }
    .evidence-item + .evidence-item {
      border-top: 1px solid var(--color-border);
    }
    .evidence-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1 1 240px;
      min-width: 0;
    }
    .evidence-icon {
      display: grid;
      place-items: center;
      flex: 0 0 48px;
      height: 48px;
      border-radius: var(--radius-control);
      background: var(--tone-blue-soft);
      color: var(--color-text);
      font-size: 24px;
    }
    .evidence-copy {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    h3 {
      margin: 0;
      color: var(--color-text);
      font: 500 16px/24px var(--font-body);
      overflow-wrap: anywhere;
    }
    .evidence-copy p,
    .empty-message {
      color: var(--color-muted);
      font: 400 15px/22px var(--font-body);
      overflow-wrap: anywhere;
    }
    .evidence-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 12px;
      max-width: 100%;
      margin-left: auto;
    }
    .evidence-actions .pill {
      max-width: 100%;
      min-height: 48px;
      height: auto;
      padding: 12px 22px;
      white-space: normal;
    }
  `,
})
export class BrandEvidenceList {
  readonly publications = input.required<readonly BrandPublication[]>();
  readonly download = output<{ id: string; title: string }>();
}
