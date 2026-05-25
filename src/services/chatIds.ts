export function normalizeChatId(to: string) {
  if (to.endsWith("@c.us") || to.endsWith("@g.us")) return to;
  if (to.startsWith("group:")) return `${to.slice("group:".length)}@g.us`;
  const digits = to.replace(/[^\d]/g, "");
  return `${digits}@c.us`;
}
