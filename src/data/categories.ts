import type { CategoryOption } from "../types/catalog";

const category = (
  id: string,
  name: string,
  slug: string,
  image: string,
): CategoryOption => ({
  id,
  name,
  image: `/assets/categories/${image}`,
  imageAlt: `${name} from the Suzuki Parts USA catalog`,
  href: `/shop/${slug}`,
});

export const categories: CategoryOption[] = [
  category("engine", "Engine Parts", "engine", "engine-parts.webp"),
  category("brakes", "Brakes", "brakes", "brakes.webp"),
  category("shocks", "Shocks & Springs", "springs-shocks", "shocks-springs.webp"),
  category("electrical", "Electrical", "electrical-batterygaugesetc", "electrical.webp"),
  category("exterior", "Exterior Parts", "exterior-parts", "exterior-parts.webp"),
  category("interior", "Interior Parts", "interior-parts", "interior-parts.webp"),
  category("transmission", "Transmission", "transmission", "transmission.webp"),
  category("cooling", "Cooling System", "cooling-system-radiator", "cooling-system.webp"),
];
