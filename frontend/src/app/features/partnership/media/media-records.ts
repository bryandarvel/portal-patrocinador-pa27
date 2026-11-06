import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import type { MediaPublication, Placement } from './media-preview.service';

@Component({
  selector: 'app-media-publications',
  imports: [NzButtonModule, NzIconModule],
  styleUrls: ['../shared/partnership-ui.css', './media-records.css'],
  template: `
    @for (publication of publications(); track publication.id) {
      <article class="media-publication">
        <span class="document-icon publication-icon" aria-hidden="true">
          <nz-icon [nzType]="publication.url && !publication.arquivoId ? 'link' : 'file-text'" />
        </span>
        <div class="publication-copy">
          <h3>{{ publication.titulo }}</h3>
          @if (publication.texto) {
            <p>{{ publication.texto }}</p>
          }
        </div>
        <div class="publication-actions">
          @if (publication.url) {
            <a
              nz-button
              class="pill"
              [href]="publication.url"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="'Abrir publicação: ' + publication.titulo + ' (abre em nova aba)'"
              ><nz-icon nzType="export" aria-hidden="true" />Abrir publicação</a
            >
          }
          @if (publication.arquivoId) {
            <button
              nz-button
              class="pill"
              type="button"
              [attr.aria-label]="'Baixar arquivo: ' + publication.titulo"
              (click)="download.emit({ id: publication.arquivoId, name: publication.titulo })"
            >
              <nz-icon nzType="download" aria-hidden="true" />Baixar arquivo
            </button>
          }
        </div>
      </article>
    }
  `,
})
export class MediaPublications {
  readonly publications = input.required<readonly MediaPublication[]>();
  readonly download = output<{ id: string; name: string }>();
}

@Component({
  selector: 'app-media-placements',
  imports: [DatePipe, NzButtonModule, NzIconModule],
  styleUrls: ['../shared/partnership-ui.css', './media-records.css'],
  template: `
    <div
      class="placements-scroll"
      role="region"
      aria-labelledby="media-comparison-title"
      tabindex="0"
    >
      <table class="placements-table" aria-labelledby="media-comparison-title">
        <thead>
          <tr>
            <th scope="col">Canal</th>
            <th scope="col">Descrição</th>
            <th scope="col">Data</th>
            <th scope="col" class="placement-action">Comprovação</th>
          </tr>
        </thead>
        <tbody>
          @for (item of placements(); track item.id) {
            <tr>
              <th scope="row">{{ item.canal }}</th>
              <td>
                {{ item.descricao }}
              </td>
              <td>
                {{ item.veiculadoEm ? (item.veiculadoEm | date: 'dd/MM/yyyy') : 'Não informada' }}
              </td>
              <td class="placement-action">
                @if (item.url) {
                  <a
                    nz-button
                    class="pill"
                    [href]="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    [attr.aria-label]="
                      'Abrir veiculação: ' +
                      item.canal +
                      ' — ' +
                      item.descricao +
                      ' (abre em nova aba)'
                    "
                  >
                    <nz-icon nzType="export" aria-hidden="true" />Abrir veiculação
                  </a>
                } @else {
                  <span class="placement-no-link">Sem link</span>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class MediaPlacements {
  readonly placements = input.required<readonly Placement[]>();
}
