export const DISCORD_WEBHOOK_RE =
  /^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

export function isValidWebhookUrl(url: string): boolean {
  return DISCORD_WEBHOOK_RE.test(url.trim());
}

/** Hide the secret token part of a webhook URL for display. */
export function maskWebhookUrl(url: string): string {
  const parts = url.trim().split("/");
  if (parts.length < 2) return url;
  const token = parts[parts.length - 1];
  const id = parts[parts.length - 2];
  return `…/${id}/${token.slice(0, 4)}${"•".repeat(6)}`;
}

/** Convert "#5865F2" (or "5865f2") to the integer Discord expects. */
export function hexToInt(hex: string): number | undefined {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return undefined;
  return parseInt(clean, 16);
}

export const MAX_CONTENT = 2000;

export function remainingChars(content: string): number {
  return MAX_CONTENT - content.length;
}
