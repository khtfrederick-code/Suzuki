const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(value: number): string {
  return money.format(value);
}

export function shopSearchHref(query: string): string {
  return `/shop?${new URLSearchParams({ q: query.trim() }).toString()}`;
}
