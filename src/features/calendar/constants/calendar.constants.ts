export const CALENDAR_CONFIG = {
  START_HOUR: 7,
  END_HOUR: 22,
  CELL_HEIGHT: 80,
  TIME_STEP: 15,
  COLUMN_WIDTH_MIN: 150,
};

export const DEFAULT_LAB_CALENDAR_FILTERS = {
  selectedRoom: "ALL",
  selectedBuilding: "ALL",
  selectedTimeRange: "ALL",
  selectedStatus: "ALL",
  selectedSlotType: "ALL",
} as const;

export const LAB_CALENDAR_TIME_RANGES = [
  { value: "ALL", label: "All Day" },
  { value: "MORNING", label: "Morning (6:00 - 12:00)" },
  { value: "AFTERNOON", label: "Afternoon (12:00 - 18:00)" },
  { value: "EVENING", label: "Evening (18:00 - 23:00)" },
] as const;
