import { announcements } from "../data/site";
import { IconExperience, IconGlobe, IconShipping } from "./Icons";

const icons = [IconExperience, IconShipping, IconGlobe];

export function AnnouncementBar() {
  return (
    <div className="announce">
      <ul>
        {announcements.map((item, index) => {
          const Icon = icons[index] ?? IconShipping;
          return (
            <li key={item}>
              <Icon />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
