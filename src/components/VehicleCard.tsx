import type { VehicleOption } from "../types/catalog";
import { IconChevron } from "./Icons";

type VehicleCardProps = {
  vehicle: VehicleOption;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function VehicleCard({ vehicle, selected, onSelect }: VehicleCardProps) {
  return (
    <button
      type="button"
      className={`choice-card${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(vehicle.id)}
    >
      <span className="choice-media">
        <img src={vehicle.image} alt={vehicle.imageAlt} width="320" height="200" />
      </span>
      <span className="choice-copy">
        <span className="choice-title">{vehicle.name}</span>
        <span className="choice-detail">{vehicle.detail}</span>
      </span>
      <IconChevron />
    </button>
  );
}
