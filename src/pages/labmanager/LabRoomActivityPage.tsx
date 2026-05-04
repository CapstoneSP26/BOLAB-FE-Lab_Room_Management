// import { useState } from "react";
// import { mockActivities } from "../../features/labroom-activity/data/mockActivities";
// import { useLabRoomActivity } from "../../hooks/useLabRoomActivity";
// import { StatCard } from "../../features/labroom-activity/components/StatCard";
// import { ActivityFilters } from "../../features/labroom-activity/components/ActivityFilters";
// import { ActivityTimeline } from "../../features/labroom-activity/components/ActivityTimeline";

// export default function LabRoomActivityPage() {
//   const [activities] = useState(mockActivities);

//   const vm = useLabRoomActivity(activities);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Room Activity Log
//           </h1>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Track all room bookings, schedules, and maintenance activities
//           </p>
//         </div>

//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <StatCard
//             label="Total Activities"
//             value={activities.length}
//             icon="📊"
//             color="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
//           />
//           <StatCard
//             label="Bookings"
//             value={activities.filter((a) => a.type.includes("BOOKING")).length}
//             icon="📝"
//             color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
//           />
//           <StatCard
//             label="Schedules"
//             value={activities.filter((a) => a.type.includes("SCHEDULE")).length}
//             icon="📅"
//             color="bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400"
//           />
//           <StatCard
//             label="Maintenance"
//             value={activities.filter((a) => a.type.includes("ROOM")).length}
//             icon="🔧"
//             color="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
//           />
//         </div>

//         <ActivityFilters
//           hasActiveFilters={vm.hasActiveFilters}
//           clearFilters={vm.clearFilters}
//           searchQuery={vm.searchQuery}
//           setSearchQuery={vm.setSearchQuery}
//           selectedBuilding={vm.selectedBuilding}
//           setSelectedBuilding={vm.setSelectedBuilding}
//           uniqueBuildings={vm.uniqueBuildings}
//           selectedRoom={vm.selectedRoom}
//           setSelectedRoom={vm.setSelectedRoom}
//           uniqueRooms={vm.uniqueRooms}
//           selectedType={vm.selectedType}
//           setSelectedType={vm.setSelectedType}
//           selectedRole={vm.selectedRole}
//           setSelectedRole={vm.setSelectedRole}
//           uniqueRoles={vm.uniqueRoles}
//         />

//         <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
//           Showing {vm.filteredActivities.length} of {activities.length}{" "}
//           activities
//         </div>

//         <ActivityTimeline
//           groupedActivities={vm.groupedActivities}
//           hasActiveFilters={vm.hasActiveFilters}
//         />
//       </div>
//     </div>
//   );
// }
