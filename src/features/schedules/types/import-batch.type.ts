export interface ImportBatchDto {
  id: string;
  name: string;
  importBatchType: number; // 1: Fixed, 2: Flexible (dựa trên Enum BE)
  semesterName: string;
  createdAt: string;
}

