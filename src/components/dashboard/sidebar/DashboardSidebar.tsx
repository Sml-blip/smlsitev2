'use client'
import Link from "next/link";
import React from "react";
import {
  Home,
  ClipboardList,
  Box,
  Users,
  SearchCheck,
  Gamepad2,
  Images,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {

  const pathname = usePathname();

  const dashboardLinks = [
    {
      link: "/dashboard",
      label: "Home",
      icon: <Home size={20} />,
      isActive: pathname === "/dashboard",
    },
    {
      link: "/dashboard/orders",
      label: "Orders",
      icon: <ClipboardList size={20} />,
      isActive: pathname.includes("dashboard/orders"),
    },
    {
      link: "/dashboard/products",
      label: "Products",
      icon: <Box size={20} />,
      isActive: pathname.includes("dashboard/products"),
    },
      {
        link: "/dashboard/customers",
        label: "Customers",
        icon: <Users size={20} />,
        isActive: pathname.includes("dashboard/customers"),
      },
      {
        link: "/dashboard/seo",
        label: "SEO",
        icon: <SearchCheck size={20} />,
        isActive: pathname.includes("dashboard/seo"),
      },
      {
        link: "/dashboard/gallery",
        label: "Galerie",
        icon: <Images size={20} />,
        isActive: pathname.includes("dashboard/gallery"),
      },
      {
        link: "/dashboard/3alouch",
        label: "🐑 عيد الأضحى",
        icon: <Gamepad2 size={20} />,
        isActive: pathname.includes("dashboard/3alouch"),
      },
  ];

  return (
    <nav className="w-64 min-h-[88vh] px-2 py-4 border-r-2 hidden lg:block">
      <div>
        <ul className="flex flex-col gap-2 items-start justify-center">
          {dashboardLinks.map((link) => (
            <li key={link.label} className="w-full">
              <Link
                href={link.link}
                className={cn("flex items-center text-lg w-full gap-2  p-2 rounded-md transition-colors duration-300 hover:bg-muted", link.isActive && 'bg-primary text-black')}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default DashboardSidebar;
