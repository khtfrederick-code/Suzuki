import type { VehicleOption } from "../types/catalog";

export const vehicles: VehicleOption[] = [
  {
    id: "samurai",
    name: "Samurai / SJ Series",
    detail: "Samurai, SJ410, and SJ413 parts in the main catalog",
    image: "/assets/vehicles/samurai-catalog.webp",
    imageAlt: "White Suzuki Samurai with a black soft top",
    href: "/shop",
  },
  {
    id: "sidekick",
    name: "Sidekick / Tracker",
    detail: "Parts for Sidekick and Tracker models",
    image: "/assets/vehicles/sidekick-catalog.webp",
    imageAlt: "Red Suzuki Sidekick with a black soft top",
    href: "/shop/sidekick-tracker",
  },
  {
    id: "lwb",
    name: "Long Wheel Base / Gypsy\u00A0King",
    detail: "Long-wheelbase and Gypsy King parts",
    image: "/assets/vehicles/gypsy-catalog.webp",
    imageAlt: "White long-wheelbase Suzuki Gypsy King with an open bed",
    href: "/shop/lwb-gypsyking",
  },
];
