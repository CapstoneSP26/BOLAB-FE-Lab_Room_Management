import { useState, useMemo } from "react";

// Types
type ActivityType =
  | "BOOKING_CREATED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "SCHEDULE_CREATED"
  | "SCHEDULE_UPDATED"
  | "SCHEDULE_DELETED"
  | "ROOM_MAINTENANCE"
  | "ROOM_INSPECTION";

type Activity = {
  id: string;
  type: ActivityType;
  roomId: number;
  roomName: string;
  building: string;
  userName: string;
  userRole: string;
  timestamp: string;
  description: string;
  details?: {
    startTime?: string;
    endTime?: string;
    previousStatus?: string;
    newStatus?: string;
    reason?: string;
  };
};

// Mock data
const mockActivities: Activity[] = [
  {
    id: "1",
    type: "BOOKING_CREATED",
    roomId: 101,
    roomName: "Room 101",
    building: "Building A",
    userName: "John Doe",
    userRole: "STUDENT",
    timestamp: "2024-03-04T10:30:00Z",
    description: "New booking request submitted",
    details: {
      startTime: "2024-03-10T08:00:00Z",
      endTime: "2024-03-10T10:00:00Z",
    },
  },
  {
    id: "2",
    type: "BOOKING_APPROVED",
    roomId: 101,
    roomName: "Room 101",
    building: "Building A",
    userName: "Dr. Smith",
    userRole: "LAB_MANAGER",
    timestamp: "2024-03-04T10:45:00Z",
    description: "Booking request approved",
    details: {
      previousStatus: "PENDING",
      newStatus: "APPROVED",
    },
  },
  {
    id: "3",
    type: "SCHEDULE_CREATED",
    roomId: 102,
    roomName: "Room 102",
    building: "Building A",
    userName: "Admin",
    userRole: "ADMIN",
    timestamp: "2024-03-04T09:15:00Z",
    description: "New schedule slot created",
    details: {
      startTime: "2024-03-12T14:00:00Z",
      endTime: "2024-03-12T16:00:00Z",
    },
  },
  {
    id: "4",
    type: "BOOKING_REJECTED",
    roomId: 201,
    roomName: "Room 201",
    building: "Building B",
    userName: "Dr. Johnson",
    userRole: "LAB_MANAGER",
    timestamp: "2024-03-04T08:20:00Z",
    description: "Booking request rejected",
    details: {
      previousStatus: "PENDING",
      newStatus: "REJECTED",
      reason: "Room under maintenance",
    },
  },
  {
    id: "5",
    type: "ROOM_MAINTENANCE",
    roomId: 201,
    roomName: "Room 201",
    building: "Building B",
    userName: "Maintenance Team",
    userRole: "ADMIN",
    timestamp: "2024-03-03T16:00:00Z",
    description: "Scheduled maintenance completed",
  },
  {
    id: "6",
    type: "BOOKING_CANCELLED",
    roomId: 103,
    roomName: "Room 103",
    building: "Building A",
    userName: "Jane Smith",
    userRole: "TEACHER",
    timestamp: "2024-03-03T14:30:00Z",
    description: "Booking cancelled by user",
    details: {
      reason: "Class rescheduled",
    },
  },
  {
    id: "7",
    type: "SCHEDULE_UPDATED",
    roomId: 102,
    roomName: "Room 102",
    building: "Building A",
    userName: "Admin",
    userRole: "ADMIN",
    timestamp: "2024-03-03T11:00:00Z",
    description: "Schedule time updated",
    details: {
      startTime: "2024-03-15T10:00:00Z",
      endTime: "2024-03-15T12:00:00Z",
    },
  },
  {
    id: "8",
    type: "ROOM_INSPECTION",
    roomId: 301,
    roomName: "Room 301",
    building: "Building C",
    userName: "Inspector",
    userRole: "ADMIN",
    timestamp: "2024-03-02T13:00:00Z",
    description: "Regular safety inspection completed",
  },
];

const activityTypeConfig: Record<
  ActivityType,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  BOOKING_CREATED: {
    label: "Booking Created",
    icon: "📝",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-500/10",
  },
  BOOKING_APPROVED: {
    label: "Booking Approved",
    icon: "✅",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
  },
  BOOKING_REJECTED: {
    label: "Booking Rejected",
    icon: "❌",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-500/10",
  },
  BOOKING_CANCELLED: {
    label: "Booking Cancelled",
    icon: "🚫",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-500/10",
  },
  SCHEDULE_CREATED: {
    label: "Schedule Created",
    icon: "➕",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-500/10",
  },
  SCHEDULE_UPDATED: {
    label: "Schedule Updated",
    icon: "✏️",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
  },
  SCHEDULE_DELETED: {
    label: "Schedule Deleted",
    icon: "🗑️",
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-500/10",
  },
  ROOM_MAINTENANCE: {
    label: "Maintenance",
    icon: "🔧",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-500/10",
  },
  ROOM_INSPECTION: {
    label: "Inspection",
    icon: "🔍",
    color: "text-cyan-700 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-500/10",
  },
};

export default function LabRoomActivity() {
  const [activities] = useState<Activity[]>(mockActivities);

  // Filters
  const [selectedRoom, setSelectedRoom] = useState<number | "ALL">("ALL");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<ActivityType | "ALL">("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique values for filters
  const uniqueRooms = useMemo(() => {
    const rooms = new Set<number>();
    activities.forEach((a) => rooms.add(a.roomId));
    return Array.from(rooms).sort((a, b) => a - b);
  }, [activities]);

  const uniqueBuildings = useMemo(() => {
    const buildings = new Set<string>();
    activities.forEach((a) => buildings.add(a.building));
    return Array.from(buildings).sort();
  }, [activities]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    activities.forEach((a) => roles.add(a.userRole));
    return Array.from(roles).sort();
  }, [activities]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Room filter
      if (selectedRoom !== "ALL" && activity.roomId !== selectedRoom) {
        return false;
      }

      // Building filter
      if (
        selectedBuilding !== "ALL" &&
        activity.building !== selectedBuilding
      ) {
        return false;
      }

      // Type filter
      if (selectedType !== "ALL" && activity.type !== selectedType) {
        return false;
      }

      // Role filter
      if (selectedRole !== "ALL" && activity.userRole !== selectedRole) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          activity.userName.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          activity.roomName.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [
    activities,
    selectedRoom,
    selectedBuilding,
    selectedType,
    selectedRole,
    searchQuery,
  ]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  }, [filteredActivities]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setSelectedRoom("ALL");
    setSelectedBuilding("ALL");
    setSelectedType("ALL");
    setSelectedRole("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedRoom !== "ALL" ||
    selectedBuilding !== "ALL" ||
    selectedType !== "ALL" ||
    selectedRole !== "ALL" ||
    searchQuery !== "";

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/10">
              <svg
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room Activity Log
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track all room bookings, schedules, and maintenance activities
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Activities"
            value={activities.length}
            icon="📊"
            color="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
          />
          <StatCard
            label="Bookings"
            value={activities.filter((a) => a.type.includes("BOOKING")).length}
            icon="📝"
            color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          />
          <StatCard
            label="Schedules"
            value={activities.filter((a) => a.type.includes("SCHEDULE")).length}
            icon="📅"
            color="bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400"
          />
          <StatCard
            label="Maintenance"
            value={activities.filter((a) => a.type.includes("ROOM")).length}
            icon="🔧"
            color="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search by user, room, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Building */}
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              <option value="ALL">All Buildings</option>
              {uniqueBuildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>

            {/* Room */}
            <select
              value={selectedRoom}
              onChange={(e) =>
                setSelectedRoom(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                )
              }
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              <option value="ALL">All Rooms</option>
              {uniqueRooms.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </select>

            {/* Activity Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ActivityType)}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              {Object.entries(activityTypeConfig).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Showing {filteredActivities.length} of {activities.length}{" "}
            activities
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No activities found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results"
                  : "Activity logs will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(groupedActivities).map(
                ([date, dateActivities]) => (
                  <div key={date} className="p-6">
                    <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {date}
                    </h3>
                    <div className="space-y-4">
                      {dateActivities.map((activity, index) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          config={activityTypeConfig[activity.type]}
                          formatTime={formatTime}
                          isLast={index === dateActivities.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  activity,
  config,
  formatTime,
  isLast,
}: {
  activity: Activity;
  config: { label: string; icon: string; color: string; bgColor: string };
  formatTime: (timestamp: string) => string;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
      >
        <span className="text-lg">{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`text-sm font-semibold ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {activity.userName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {activity.roomName}
            </span>
            <span className="rounded-lg bg-white px-2 py-1 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {activity.building}
            </span>
          </div>

          {/* Additional details */}
          {activity.details && (
            <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700">
              {activity.details.startTime && activity.details.endTime && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Time slot:</span>{" "}
                  {new Date(activity.details.startTime).toLocaleString()} -{" "}
                  {new Date(activity.details.endTime).toLocaleTimeString()}
                </p>
              )}
              {activity.details.previousStatus &&
                activity.details.newStatus && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Status changed:</span>{" "}
                    {activity.details.previousStatus} →{" "}
                    {activity.details.newStatus}
                  </p>
                )}
              {activity.details.reason && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Reason:</span>{" "}
                  {activity.details.reason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
