// import { useMemo, useState } from "react";
// import type { Activity, ActivityType } from "../type";
// import { formatDateHeading } from "../utils/labmanager/format";

// export type RoomFilter = number | "ALL";
// export type TypeFilter = ActivityType | "ALL";
// export type RoleFilter = string | "ALL";
// export type BuildingFilter = string | "ALL";

// export function useLabRoomActivity(activities: Activity[]) {
//   const [selectedRoom, setSelectedRoom] = useState<RoomFilter>("ALL");
//   const [selectedBuilding, setSelectedBuilding] =
//     useState<BuildingFilter>("ALL");
//   const [selectedType, setSelectedType] = useState<TypeFilter>("ALL");
//   const [selectedRole, setSelectedRole] = useState<RoleFilter>("ALL");
//   const [searchQuery, setSearchQuery] = useState("");

//   const uniqueRooms = useMemo(() => {
//     const s = new Set<number>();
//     for (const a of activities) s.add(a.roomId);
//     return Array.from(s).sort((a, b) => a - b);
//   }, [activities]);

//   const uniqueBuildings = useMemo(() => {
//     const s = new Set<string>();
//     for (const a of activities) s.add(a.building);
//     return Array.from(s).sort();
//   }, [activities]);

//   const uniqueRoles = useMemo(() => {
//     const s = new Set<string>();
//     for (const a of activities) s.add(a.userRole);
//     return Array.from(s).sort();
//   }, [activities]);

//   const filteredActivities = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();

//     return activities.filter((a) => {
//       if (selectedRoom !== "ALL" && a.roomId !== selectedRoom) return false;
//       if (selectedBuilding !== "ALL" && a.building !== selectedBuilding)
//         return false;
//       if (selectedType !== "ALL" && a.type !== selectedType) return false;
//       if (selectedRole !== "ALL" && a.userRole !== selectedRole) return false;

//       if (q) {
//         return (
//           a.userName.toLowerCase().includes(q) ||
//           a.description.toLowerCase().includes(q) ||
//           a.roomName.toLowerCase().includes(q)
//         );
//       }
//       return true;
//     });
//   }, [
//     activities,
//     selectedRoom,
//     selectedBuilding,
//     selectedType,
//     selectedRole,
//     searchQuery,
//   ]);

//   const groupedActivities = useMemo(() => {
//     const groups: Record<string, Activity[]> = {};
//     for (const a of filteredActivities) {
//       const key = formatDateHeading(a.timestamp);
//       (groups[key] ??= []).push(a);
//     }
//     // nếu muốn: sort trong mỗi group theo timestamp desc
//     for (const k of Object.keys(groups)) {
//       groups[k].sort((x, y) => (x.timestamp < y.timestamp ? 1 : -1));
//     }
//     return groups;
//   }, [filteredActivities]);

//   const clearFilters = () => {
//     setSelectedRoom("ALL");
//     setSelectedBuilding("ALL");
//     setSelectedType("ALL");
//     setSelectedRole("ALL");
//     setSearchQuery("");
//   };

//   const hasActiveFilters =
//     selectedRoom !== "ALL" ||
//     selectedBuilding !== "ALL" ||
//     selectedType !== "ALL" ||
//     selectedRole !== "ALL" ||
//     searchQuery.trim() !== "";

//   return {
//     // data
//     filteredActivities,
//     groupedActivities,
//     uniqueRooms,
//     uniqueBuildings,
//     uniqueRoles,

//     // filters + setters
//     selectedRoom,
//     setSelectedRoom,
//     selectedBuilding,
//     setSelectedBuilding,
//     selectedType,
//     setSelectedType,
//     selectedRole,
//     setSelectedRole,
//     searchQuery,
//     setSearchQuery,

//     // helpers
//     clearFilters,
//     hasActiveFilters,
//   };
// }
