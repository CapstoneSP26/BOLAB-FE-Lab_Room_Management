import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  IncidentHistoryIcon,
  ListBookingRequest,
  ListIcon,
  ImportFileIcon,
} from "../components/icon/index.ts";
import type React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };
export type IconComp = React.ComponentType<IconProps>;

export type SubItem = {
  name: string;
  path: string;
  new?: boolean;
  pro?: boolean;
};

export type MenuItem = {
  name: string;
  icon: IconComp;
  path?: string;
  subItems?: SubItem[];
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export const labManagerMenuGroups: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      { icon: GridIcon, name: "Dashboard", path: "/labmanager/dashboard" },
      {
        icon: CalenderIcon,
        name: "Room Schedule",
        path: "/labmanager/lab-scheduler",
      },
      {
        icon: ListBookingRequest,
        name: "Booking Requests",
        subItems: [
          {
            name: "Upcoming Request",
            path: "/labmanager/booking-requests/pending",
          },
          {
            name: "Approve/Reject History",
            path: "/labmanager/booking-requests/history",
          },
        ],
      },
      {
        icon: ImportFileIcon,
        name: "Import File",
        subItems: [
          {
            name: "Import Booking",
            path: "/labmanager/booking-requests/import",
          },
        ],
      },
      { icon: ListIcon, name: "Report List", path: "/labmanager/reports" },
      {
        icon: IncidentHistoryIcon,
        name: "Incident History",
        path: "/labmanager/incident-history",
      },
      {
        icon: UserCircleIcon,
        name: "User Profile",
        path: "/labmanager/user-profile",
      },
    ],
  },
];

export const adminMenuGroups: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      { icon: GridIcon, name: "Dashboard", path: "/admin/dashboard" },

      {
        icon: CalenderIcon,
        name: "Room Schedule",
        path: "/admin/room-schedule",
      },

      {
        icon: ListBookingRequest,
        name: "Booking Requests",
        subItems: [
          { name: "Upcoming Request", path: "/admin/booking-requests/pending" },
          {
            name: "Approve/Reject History",
            path: "/admin/booking-requests/history",
          },
        ],
      },
      {
        icon: ImportFileIcon,
        name: "Import File",
        subItems: [
          {
            name: "Import Booking",
            path: "/admin/booking-requests/import",
          },
        ],
      },

      { icon: ListIcon, name: "Report List", path: "/admin/reports" },
      {
        icon: IncidentHistoryIcon,
        name: "Incident History",
        path: "/admin/incident-history",
      },

      { icon: ListIcon, name: "Campus Management", path: "/admin/campus" },
      {
        icon: ListIcon,
        name: "Buildings Management",
        path: "/admin/buildings",
      },
      { icon: ListIcon, name: "Rooms Management", path: "/admin/rooms" },

      { icon: ListIcon, name: "Slot Management", path: "/admin/slots" },
    ],
  },
];
