export interface Room {
  id: number;
  name: string;
  building: string;
  capacity: number;
  status: "Available" | "Occupied" | "Maintenance";
  image: string;
  features: string[];
  nextAvailable: string;
}

export interface LabRoomLookupResponse {
  id: number | string;
  name?: string;
  labRoomName?: string;
  building?: string;
  buildingName?: string;
  capacity?: number;
  status?: "Available" | "Occupied" | "Maintenance";
  image?: string;
  features?: string[];
  nextAvailable?: string;
}

export type LabRoomLookupApiResponse =
  | LabRoomLookupResponse[]
  | { data?: LabRoomLookupResponse[] };
