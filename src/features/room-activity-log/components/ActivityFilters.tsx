// import type { ActivityType } from "../type";
// import type {
//   BuildingFilter,
//   RoomFilter,
//   RoleFilter,
//   TypeFilter,
// } from "../hooks/useLabRoomActivity";
// import { activityTypeConfig } from "../activityTypeConfig";

// export function ActivityFilters(props: {
//   hasActiveFilters: boolean;
//   clearFilters: () => void;

//   searchQuery: string;
//   setSearchQuery: (v: string) => void;

//   selectedBuilding: BuildingFilter;
//   setSelectedBuilding: (v: BuildingFilter) => void;
//   uniqueBuildings: string[];

//   selectedRoom: RoomFilter;
//   setSelectedRoom: (v: RoomFilter) => void;
//   uniqueRooms: number[];

//   selectedType: TypeFilter;
//   setSelectedType: (v: TypeFilter) => void;

//   selectedRole: RoleFilter;
//   setSelectedRole: (v: RoleFilter) => void;
//   uniqueRoles: string[];
// }) {
//   const {
//     hasActiveFilters,
//     clearFilters,
//     searchQuery,
//     setSearchQuery,
//     selectedBuilding,
//     setSelectedBuilding,
//     uniqueBuildings,
//     selectedRoom,
//     setSelectedRoom,
//     uniqueRooms,
//     selectedType,
//     setSelectedType,
//     selectedRole,
//     setSelectedRole,
//     uniqueRoles,
//   } = props;

//   return (
//     <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
//       <div className="mb-4 flex items-center justify-between">
//         <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
//           Filters
//         </h3>
//         {hasActiveFilters && (
//           <button
//             type="button"
//             onClick={clearFilters}
//             className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
//           >
//             Clear All
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
//         <div className="lg:col-span-2">
//           <input
//             type="text"
//             placeholder="Search by user, room, or description..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
//           />
//         </div>

//         <select
//           value={selectedBuilding}
//           onChange={(e) =>
//             setSelectedBuilding(e.target.value as BuildingFilter)
//           }
//           className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
//         >
//           <option value="ALL">All Buildings</option>
//           {uniqueBuildings.map((b) => (
//             <option key={b} value={b}>
//               {b}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedRoom}
//           onChange={(e) =>
//             setSelectedRoom(
//               e.target.value === "ALL" ? "ALL" : Number(e.target.value),
//             )
//           }
//           className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
//         >
//           <option value="ALL">All Rooms</option>
//           {uniqueRooms.map((r) => (
//             <option key={r} value={r}>
//               Room {r}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedType}
//           onChange={(e) =>
//             setSelectedType(e.target.value as ActivityType | "ALL")
//           }
//           className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
//         >
//           <option value="ALL">All Types</option>
//           {Object.entries(activityTypeConfig).map(([t, cfg]) => (
//             <option key={t} value={t}>
//               {cfg.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* optional: role dropdown */}
//       <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
//         <select
//           value={selectedRole}
//           onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
//           className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
//         >
//           <option value="ALL">All Roles</option>
//           {uniqueRoles.map((r) => (
//             <option key={r} value={r}>
//               {r}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }
