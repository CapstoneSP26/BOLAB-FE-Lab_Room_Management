import { type FormEvent, useEffect, useState } from "react";
import { Loader2, PencilLine, Plus, PlusCircle, Trash2, X } from "lucide-react";
import type { SlotType } from "../../slot/types/slot.types";
import type { UpsertSlotTypePayload } from "../types/scheduleManagement.type";

type FrameRow = {
  id?: number;
  startTime: string;
  endTime: string;
  orderIndex: number;
};

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  slotType?: SlotType | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpsertSlotTypePayload) => Promise<void>;
};

function normalizeTime(value: string): string {
  const v = value.trim();
  if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v;
  return v;
}

function defaultFrames(slot?: SlotType | null): FrameRow[] {
  if (slot?.slotFrames?.length) {
    return slot.slotFrames.map((f, i) => ({
      id: f.id,
      startTime: f.startTime?.slice(0, 8) ?? "07:00:00",
      endTime: f.endTime?.slice(0, 8) ?? "08:30:00",
      orderIndex: f.orderIndex ?? i,
    }));
  }
  return [
    { startTime: "07:00:00", endTime: "08:30:00", orderIndex: 0 },
  ];
}

export default function SlotTypeFormModal({
  isOpen,
  mode,
  slotType,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [campusId, setCampusId] = useState("");
  const [frames, setFrames] = useState<FrameRow[]>(() => defaultFrames(null));

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && slotType) {
      setCode(slotType.code ?? "");
      setName(slotType.name ?? "");
      setCampusId("");
      setFrames(defaultFrames(slotType));
    } else {
      setCode("");
      setName("");
      setCampusId("");
      setFrames(defaultFrames(null));
    }
  }, [isOpen, mode, slotType]);

  if (!isOpen) return null;

  const addFrame = () => {
    setFrames((prev) => [
      ...prev,
      {
        startTime: "09:00:00",
        endTime: "10:30:00",
        orderIndex: prev.length,
      },
    ]);
  };

  const removeFrame = (index: number) => {
    setFrames((prev) => prev.filter((_, i) => i !== index));
  };

  const patchFrame = (index: number, partial: Partial<FrameRow>) => {
    setFrames((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...partial } : row)),
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: UpsertSlotTypePayload = {
      code: code.trim(),
      name: name.trim(),
      campusId:
        campusId.trim() === "" ? undefined : Number(campusId),
      slotFrames: frames.map((f, i) => ({
        id: f.id,
        startTime: normalizeTime(f.startTime),
        endTime: normalizeTime(f.endTime),
        orderIndex: f.orderIndex ?? i,
      })),
    };

    if (!payload.code || !payload.name) return;
    if (!payload.slotFrames.length) return;

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
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
                {mode === "create" ? "Add slot type" : "Update slot type"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === "edit" && slotType
                  ? `ID #${slotType.id}`
                  : "Define code, name, and time frames."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Code
              </span>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Name
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Campus ID (optional)
            </span>
            <input
              type="number"
              min={1}
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Slot frames
              </span>
              <button
                type="button"
                onClick={addFrame}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add frame
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              {frames.map((row, index) => (
                <div
                  key={`${row.orderIndex}-${index}`}
                  className="grid gap-2 rounded-lg bg-gray-50 p-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end dark:bg-white/[0.04]"
                >
                  <label className="flex flex-col gap-1 text-xs">
                    <span>Start (HH:mm:ss)</span>
                    <input
                      required
                      value={row.startTime}
                      onChange={(e) =>
                        patchFrame(index, { startTime: e.target.value })
                      }
                      placeholder="07:00:00"
                      className="rounded border border-gray-200 px-2 py-1 font-mono text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    <span>End (HH:mm:ss)</span>
                    <input
                      required
                      value={row.endTime}
                      onChange={(e) =>
                        patchFrame(index, { endTime: e.target.value })
                      }
                      placeholder="08:30:00"
                      className="rounded border border-gray-200 px-2 py-1 font-mono text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    <span>Order</span>
                    <input
                      type="number"
                      min={0}
                      value={row.orderIndex}
                      onChange={(e) =>
                        patchFrame(index, {
                          orderIndex: Number(e.target.value),
                        })
                      }
                      className="rounded border border-gray-200 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeFrame(index)}
                    disabled={frames.length <= 1}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/40 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
