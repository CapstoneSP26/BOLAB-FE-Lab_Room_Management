import { useState, type FormEvent } from "react";
import { Building2, Cpu, Loader2, MapPin, PencilLine, PlusCircle, X } from "lucide-react";
import type { BuildingDto } from "../../building/types/building.type";
import { getDefaultLabRoomFormValues } from "../types/room.mapper";
import type { LabRoomDto, LabRoomFormValues } from "../types/room.type";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  room?: LabRoomDto | null;
  buildingOptions: BuildingDto[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: LabRoomFormValues) => Promise<void>;
};

type FormErrors = Partial<Record<keyof LabRoomFormValues, string>>;

export default function RoomFormModal({
  isOpen,
  mode,
  room,
  buildingOptions,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<LabRoomFormValues>(() =>
    getDefaultLabRoomFormValues(room),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) {
    return null;
  }

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.roomName.trim()) {
      nextErrors.roomName = "Room name is required.";
    }

    if (!values.roomNo.trim()) {
      nextErrors.roomNo = "Room number is required.";
    }

    if (values.buildingId === "") {
      nextErrors.buildingId = "Building is required.";
    }

    if (!Number.isFinite(values.capacity) || Number(values.capacity) <= 0) {
      nextErrors.capacity = "Capacity must be greater than 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = <K extends keyof LabRoomFormValues>(
    key: K,
    value: LabRoomFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      ...values,
      capacity: Number(values.capacity),
    });
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
              {mode === "create" ? (
                <PlusCircle className="h-5 w-5" />
              ) : (
                <PencilLine className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "create" ? "Add Lab Room" : "Update Lab Room"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === "create"
                  ? "Create a new lab room and assign building details."
                  : `Editing ${room?.roomName ?? "selected room"}.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Room name *
              </label>
              <input
                value={values.roomName}
                onChange={(event) => handleChange("roomName", event.target.value)}
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="Lab A-501"
              />
              {errors.roomName && (
                <p className="mt-1 text-sm text-red-600">{errors.roomName}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Room number *
              </label>
              <input
                value={values.roomNo}
                onChange={(event) => handleChange("roomNo", event.target.value)}
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="501"
              />
              {errors.roomNo && (
                <p className="mt-1 text-sm text-red-600">{errors.roomNo}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Building *
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={values.buildingId === "" ? "" : String(values.buildingId)}
                  onChange={(event) =>
                    handleChange(
                      "buildingId",
                      event.target.value === "" ? "" : Number(event.target.value),
                    )
                  }
                  disabled={isLoading}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                >
                  <option value="">Select building</option>
                  {buildingOptions.map((building) => (
                    <option key={building.id} value={String(building.id)}>
                      {building.buildingName}
                    </option>
                  ))}
                </select>
              </div>
              {errors.buildingId && (
                <p className="mt-1 text-sm text-red-600">{errors.buildingId}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacity *
              </label>
              <input
                type="number"
                min={1}
                value={values.capacity}
                onChange={(event) =>
                  handleChange("capacity", Number(event.target.value))
                }
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={values.location}
                  onChange={(event) => handleChange("location", event.target.value)}
                  disabled={isLoading}
                  className="h-11 w-full rounded-xl border border-gray-300 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                  placeholder="Floor 5, East Wing"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Equipment status
              </label>
              <div className="relative">
                <Cpu className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={values.hasEquipment ? "READY" : "EMPTY"}
                  onChange={(event) =>
                    handleChange("hasEquipment", event.target.value === "READY")
                  }
                  disabled={isLoading}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                >
                  <option value="READY">Ready</option>
                  <option value="EMPTY">Not ready</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={values.isActive ? "ACTIVE" : "DEACTIVATED"}
                onChange={(event) =>
                  handleChange("isActive", event.target.value === "ACTIVE")
                }
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              >
                <option value="ACTIVE">Activate</option>
                <option value="DEACTIVATED">De-activate</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={values.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                disabled={isLoading}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="Room description, device notes, or internal comment..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Room" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
