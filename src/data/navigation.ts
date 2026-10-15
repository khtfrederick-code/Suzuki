import categoryFile from "./catalog/categories.json";
import type { NavItem, NavLink } from "../types/catalog";

const categories = [...categoryFile.categories].sort((a, b) => a.name.localeCompare(b.name));

export const shopGroups: { label: string; href: string; children: NavLink[] }[] = categories
  .filter((category) => category.parentId === 0)
  .map((category) => ({
    label: category.name,
    href: `/shop/${category.slug}`,
    children: categories
      .filter((child) => child.parentId === category.id)
      .map((child) => ({
        label: child.name,
        href: `/shop/${child.slug}`,
      })),
  }));

export const mainNav: NavItem[] = [
  { label: "Shop Parts", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop Parts", href: "/shop" },
      { label: "New & Restocked", href: "/#back-in-stock" },
      { label: "Clearance", href: "/shop/clearance" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping Questions", href: "/faq#shipping" },
      { label: "Return Policy", href: "/returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
];
