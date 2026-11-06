import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface HistoryVersion {
  readonly id?: string;
  readonly name: string;
  readonly version: number;
  readonly receivedAt: Date | null;
}

@Component({
  selector: 'app-material-version-history',
  imports: [DatePipe, NzButtonModule, NzIconModule],
  styleUrls: ['./partnership-ui.css'],
  template: `
    @if (versions().length) {
      <ul class="version-list" role="list">
        @for (entry of versions(); track entry.version) {
          <li class="version-row">
            <span class="document-icon" aria-hidden="true"><nz-icon nzType="file-text" /></span>
            <div class="version-copy">
              <p class="version-name">{{ entry.name }}</p>
              <p class="version-meta">
                <span class="version-number">Versão {{ entry.version }}</span>
                @if (entry.receivedAt; as date) {
                  <time [attr.datetime]="date | date: 'yyyy-MM-dd'">{{
                    date | date: 'dd/MM/yyyy'
                  }}</time>
                }
              </p>
            </div>
            @if (entry.id; as id) {
              <button
                nz-button
                class="pill version-download"
                type="button"
                [attr.aria-label]="'Baixar arquivo da versão ' + entry.version"
                (click)="download.emit({ id, name: entry.name })"
              >
                <nz-icon nzType="download" aria-hidden="true" />Baixar arquivo
              </button>
            }
          </li>
        }
      </ul>
    } @else {
      <p class="empty-history">Nenhuma versão enviada.</p>
    }
  `,
  styles: `
    :host {
      width: 100%;
      min-width: 0;
    }

    .version-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .version-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 12px 16px;
      padding-block: 16px;
    }

    .version-row + .version-row {
      border-top: 1px solid var(--color-border);
    }

    .version-row:first-child {
      padding-top: 0;
    }
    .version-row:last-child {
      padding-bottom: 0;
    }

    .version-copy {
      display: grid;
      gap: 6px;
      overflow-wrap: anywhere;
    }

    .version-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 10px;
      color: var(--color-muted);
      font-size: 13px;
      line-height: 20px;
      font-variant-numeric: tabular-nums;
    }

    .version-number {
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--color-paper);
      color: var(--color-text);
      font-weight: 500;
    }

    .version-name {
      color: var(--color-text);
      font: 500 15px/22px var(--font-body);
      white-space: pre-wrap;
    }

    .empty-history {
      color: var(--color-muted);
    }
    .version-download {
      padding-inline: 16px;
    }

    @media (max-width: 600px) {
      .version-row {
        grid-template-columns: auto minmax(0, 1fr);
      }
      .version-download {
        grid-column: 2;
        justify-self: start;
      }
    }
  `,
})
export class MaterialVersionHistory {
  readonly versions = input.required<readonly HistoryVersion[]>();
  readonly download = output<{ id: string; name: string }>();
}
