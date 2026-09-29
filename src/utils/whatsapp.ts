const WHATSAPP_NUMBER = '6281234567890';

/** wa.me link with a properly encoded message (item names may contain &, #, % or emoji). */
export function buildWhatsAppUrl(lines: string[]): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}
