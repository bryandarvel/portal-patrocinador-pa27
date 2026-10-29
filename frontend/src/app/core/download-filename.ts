/** Usa o nome original enviado pela API, com fallback para respostas sem cabeçalho. */
export function downloadFilename(disposition: string | null, fallback: string): string {
  const extended = disposition?.match(/(?:^|;)\s*filename\*\s*=\s*UTF-8'[^']*'([^;]*)/i);
  if (extended) {
    try {
      const name = safeFilename(decodeURIComponent(extended[1].trim()));
      if (name) return name;
    } catch {
      // Um filename* inválido não impede usar filename ou o nome já conhecido.
    }
  }
  const plain = disposition?.match(/(?:^|;)\s*filename\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^;]*))/i);
  const name = plain?.[1]?.replace(/\\(["\\])/g, '$1') ?? plain?.[2];
  return safeFilename(name ?? '') || safeFilename(fallback) || 'arquivo';
}

function safeFilename(value: string): string {
  const basename = value.split(/[\\/]/).pop() ?? '';
  return basename
    .replace(/[<>:"|?*\u0000-\u001f\u007f]/g, '_')
    .trim()
    .replace(/[. ]+$/g, '');
}
