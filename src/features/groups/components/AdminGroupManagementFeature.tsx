import { useDeferredValue, useMemo, useState } from "react";
import { Users, ChevronDown, Filter, Plus, RefreshCw, X } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import {
  EmptyIcon,
  EmptyState,
  LoadingSkeleton,
  ReportStatCard,
} from "../../../components/ui/ComponentsParts";
import AdminGroupManagementFilters from "./AdminGroupManagementFilters";
import AdminGroupManagementTable from "./AdminGroupManagementTable";
import type { Group } from "../types/group.type";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupMembers,
  useAddGroupMember,
  useRemoveGroupMember,
} from "../hooks/useGroups";
import { getErrorMessage } from "../../../utils/error";
import AdminGroupFormModal from "./AdminGroupFormModal";
import GroupStudentsModal from "./GroupStudentsModal";

const PAGE_SIZE = 10;

export default function AdminGroupManagementFeature() {
  const toast = useToast();
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<Group | null>(null);

  const deferredSearch = useDeferredValue(searchQuery.trim());

  const {
    data: pagedGroups,
    isLoading,
    isFetching,
    refetch,
  } = useGroups({
    enabled: true,
  });

  const allGroups = useMemo(() => pagedGroups?.items ?? [], [pagedGroups?.items]);
  
  const filteredGroups = useMemo(() => {
    if (!deferredSearch) return allGroups;
    return allGroups.filter((g) => 
      g.groupName.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      g.ownerName?.toLowerCase().includes(deferredSearch.toLowerCase())
    );
  }, [allGroups, deferredSearch]);

  const totalCount = filteredGroups.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredGroups.slice(start, start + PAGE_SIZE);
  }, [filteredGroups, page]);

  const loading = isLoading || isFetching;

  const createMutation = useCreateGroup({
    onSuccess: (data: any) => {
      toast.success("Success", data?.message || "Group created successfully");
      setIsModalOpen(false);
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast.error("Create failed", getErrorMessage(error, "Unable to create group."));
    },
  });

  const updateMutation = useUpdateGroup({
    onSuccess: (data: any) => {
      toast.success("Success", data?.message || "Group updated successfully");
      setIsModalOpen(false);
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast.error("Update failed", getErrorMessage(error, "Unable to update group."));
    },
  });

  const deleteMutation = useDeleteGroup({
    onSuccess: (data: any) => {
      toast.success("Success", data?.message || "Group deleted successfully");
      setActionLoadingId(null);
    },
    onError: (error) => {
      toast.error("Delete failed", getErrorMessage(error, "Unable to delete group."));
      setActionLoadingId(null);
    },
  });

  // Fetch members for the selected group
  const { data: membersData, isLoading: isLoadingMembers } = useGroupMembers({
    groupId: selectedGroupForMembers?.id || "",
    enabled: isMembersModalOpen && !!selectedGroupForMembers,
  });

  const addMemberMutation = useAddGroupMember({
    onSuccess: (data: any) => toast.success("Success", data?.message || "Student added to group"),
    onError: (error) => toast.error("Add failed", getErrorMessage(error, "Unable to add student")),
  });

  const removeMemberMutation = useRemoveGroupMember({
    onSuccess: (data: any) => toast.success("Success", data?.message || "Student removed from group"),
    onError: (error) => toast.error("Remove failed", getErrorMessage(error, "Unable to remove student")),
  });

  const modalLoading = createMutation.isPending || updateMutation.isPending;

  const stats = useMemo(() => {
    const memberCountOnPage = rows.reduce(
      (acc, item) => acc + (item.memberCount ?? 0),
      0,
    );

    return {
      total: totalCount,
      memberCountOnPage,
      currentPage: page,
      pageSize: PAGE_SIZE,
    };
  }, [page, rows, totalCount]);

  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== "";
  }, [searchQuery]);

  const activeFilterCount = useMemo(() => {
    return [searchQuery.trim() !== ""].filter(Boolean).length;
  }, [searchQuery]);

  const handleReset = () => {
    setSearchQuery("");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setModalMode("edit");
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: { groupName: string }) => {
    if (modalMode === "create") {
      await createMutation.mutateAsync({ groupName: values.groupName });
      return;
    }

    if (!selectedGroup?.id) {
      toast.error("Update failed", "Unable to determine which group to update.");
      return;
    }

    await updateMutation.mutateAsync({
      groupId: selectedGroup.id,
      groupName: values.groupName,
    });
  };

  const handleDelete = async (group: Group) => {
    if (
      !window.confirm(
        `Delete ${group.groupName || "this group"} permanently?`
      )
    ) {
      return;
    }

    setActionLoadingId(group.id);
    await deleteMutation.mutateAsync(group.id);
  };

  const handleViewMembers = (group: Group) => {
    setSelectedGroupForMembers(group);
    setIsMembersModalOpen(true);
  };

  const currentMembersData = membersData?.items || [];

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-blue-900/5 dark:to-indigo-900/5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Groups Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Search and manage groups with their details.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <ReportStatCard
                label="Total Groups"
                value={stats.total}
                icon={<Users className="h-5 w-5" />}
                color="blue"
              />
              <ReportStatCard
                label="Members (On Page)"
                value={stats.memberCountOnPage}
                icon={<Users className="h-5 w-5" />}
                color="emerald"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="w-full border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 text-left transition-all hover:from-gray-100 hover:to-gray-200/50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:from-gray-700 dark:hover:to-gray-700/50"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-all dark:bg-gray-700 ${
                    showFilters ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Group Filters
                  </h3>
                </div>

                {hasActiveFilters && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReset();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </button>
              )}
            </div>
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                <AdminGroupManagementFilters
                  searchQuery={searchQuery}
                  onSearchChange={(val) => {
                    setSearchQuery(val);
                    setPage(1);
                  }}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          {loading && rows.length === 0 ? (
            <LoadingSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No Groups Found"
              description={
                hasActiveFilters
                  ? "No groups match your current filters. Try changing search."
                  : "No groups are available yet."
              }
              icon={<EmptyIcon />}
              onReset={hasActiveFilters ? handleReset : undefined}
            />
          ) : (
            <div className="overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Group Directory
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Search by group name.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {loading && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {rows.length} group(s) on this page
                    </span>
                  </div>
                </div>
              </div>

              <AdminGroupManagementTable
                rows={rows}
                loading={loading}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onViewMembers={handleViewMembers}
                actionLoadingId={actionLoadingId}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AdminGroupFormModal
          key={`${modalMode}:${selectedGroup?.id ?? "new"}`}
          isOpen={isModalOpen}
          mode={modalMode}
          group={selectedGroup}
          isLoading={modalLoading}
          onClose={() => {
            if (modalLoading) return;
            setIsModalOpen(false);
            setSelectedGroup(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {isMembersModalOpen && selectedGroupForMembers && (
        <GroupStudentsModal
          isOpen={isMembersModalOpen}
          onClose={() => {
            setIsMembersModalOpen(false);
            setSelectedGroupForMembers(null);
          }}
          group={selectedGroupForMembers}
          students={currentMembersData}
          isLoading={isLoadingMembers || addMemberMutation.isPending}
          onAddStudent={async (studentId, subjectCode) => {
            await addMemberMutation.mutateAsync({
              groupId: selectedGroupForMembers.id,
              userId: studentId,
              subjectCode: subjectCode || undefined,
            });
          }}
          onRemoveStudent={async (studentId, subjectCode) => {
            await removeMemberMutation.mutateAsync({
              groupId: selectedGroupForMembers.id,
              userId: studentId,
              subjectCode: subjectCode,
            });
          }}
        />
      )}
    </>
  );
}
