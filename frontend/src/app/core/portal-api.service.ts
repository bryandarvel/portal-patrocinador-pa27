import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { downloadFilename } from './download-filename';

export interface PortalArquivo {
  id: string;
  nome: string;
  tamanho: number;
  contentType: string;
  versao: number;
  criadoEm: string;
}

export function apiError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse))
    return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
  if (error.status === 0)
    return 'Não foi possível acessar o servidor. Confira sua conexão e tente novamente.';
  const detail = error.error?.detail;
  if (typeof detail === 'string' && detail && detail !== 'Invalid request content.') return detail;
  return (
    (
      {
        400: 'Confira os campos informados.',
        401: 'Acesso não autenticado. Entre novamente ou confira os dados da conta.',
        403: 'Sua conta não tem permissão para esta operação.',
        404: 'O registro não está disponível para esta conta.',
        409: 'O registro foi alterado ou a operação conflita com seu estado atual. Recarregue antes de tentar novamente.',
        413: 'O arquivo excede o tamanho permitido.',
        415: 'Este formato de arquivo não é aceito.',
      } as Record<number, string>
    )[error.status] ?? 'Não foi possível concluir a operação. Tente novamente.'
  );
}

@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  readonly pending = signal(0);
  readonly error = signal('');
  readonly notice = signal('');

  private async perform<T>(operation: () => Promise<T>): Promise<T> {
    this.pending.update((n) => n + 1);
    this.error.set('');
    try {
      return await operation();
    } catch (error) {
      const message = apiError(error);
      this.error.set(message);
      void import('ng-zorro-antd/message')
        .then(({ NzMessageService }) => this.injector.get(NzMessageService).error(message))
        .catch(() => {});
      throw error;
    } finally {
      this.pending.update((n) => Math.max(0, n - 1));
    }
  }
  get<T>(path: string): Promise<T> {
    return this.perform(() => firstValueFrom(this.http.get<T>(path)));
  }
  post<T>(path: string, body: unknown = {}): Promise<T> {
    return this.perform(() => firstValueFrom(this.http.post<T>(path, body)));
  }
  put<T>(path: string, body: unknown): Promise<T> {
    return this.perform(() => firstValueFrom(this.http.put<T>(path, body)));
  }
  patch<T>(path: string, body: unknown): Promise<T> {
    return this.perform(() => firstValueFrom(this.http.patch<T>(path, body)));
  }
  upload<T>(path: string, file: File, fields: Record<string, string> = {}): Promise<T> {
    const body = new FormData();
    body.append('arquivo', file);
    for (const [key, value] of Object.entries(fields)) body.append(key, value);
    return this.post<T>(path, body);
  }
  publication<T>(path: string, data: unknown, file: File | null): Promise<T> {
    if (!file) return this.post<T>(path, data);
    const body = new FormData();
    body.append('dados', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    body.append('arquivo', file);
    return this.post<T>(path, body);
  }
  download(path: string, name: string): Promise<void> {
    return this.perform(async () => {
      const response = await firstValueFrom(
        this.http.get(path, { responseType: 'blob', observe: 'response' }),
      );
      if (!response.body) throw new Error('O arquivo não está disponível para download.');
      const url = URL.createObjectURL(response.body);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename(response.headers.get('Content-Disposition'), name);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
  }
  clearFeedback(): void {
    this.error.set('');
    this.notice.set('');
  }
}
