export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
export const MAX_FILE_SIZE_MB = 10;

export const LABROOM_COLUMNS = [
  "BuildingId",
  "RoomName",
  "RoomNo",
  "Location",
  "Capacity",
  "HasEquipment",
  "OverrideNumber",
  "Description",
] as const;

export const columnLabels = {
  id: "ID",
  BuildingId: "BuildingId",
  RoomName: "RoomName",
  RoomNo: "RoomNo",
  Location: "Location",
  Capacity: "Capacity",
  HasEquipment: "HasEquipment",
  OverrideNumber: "OverrideNumber",
  Description: "Description",
} as const;

export const columnWidths = {
  id: "0px",
  BuildingId: "120px",
  RoomName: "150px",
  RoomNo: "120px",
  Location: "130px",
  Capacity: "100px",
  HasEquipment: "140px",
  OverrideNumber: "140px",
  Description: "180px",
} as const;
