import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  RefreshCw,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import {
  EmptyIcon,
  EmptyState,
  LoadingSkeleton,
  ReportStatCard,
} from "../../../components/ui/ComponentsParts";
import { getErrorMessage } from "../../../utils/error";
import {
  getRoleLabel,
  mapUserFormValuesToCreateRequest,
  mapUserFormValuesToUpdateRequest,
} from "../types/userManagement.mapper";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUpdateUserStatus,
  useUsers,
} from "../hooks/useUserManagement";
import type {
  GetUsersRequest,
  UserFormValues,
  UserListItem,
  UserRole,
  UserSortOrder,
  UserStatusFilter,
} from "../types/userManagement.type";
import UserFormModal from "./UserFormModal";
import UserManagementFilters from "./UserManagementFilters";
import UserManagementTable from "./UserManagementTable";

const PAGE_SIZE = 10;

export default function UserManagementFeature() {
  const toast = useToast();

  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [status, setStatus] = useState<UserStatusFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<UserSortOrder>("DESC");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search.trim());

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, role, status]);

  const params: GetUsersRequest = useMemo(
    () => ({
      q: deferredSearch || undefined,
      role: role === "ALL" ? undefined : role,
      isActive: status === "ALL" ? undefined : status === "ACTIVE",
      page,
      limit: PAGE_SIZE,
      sortBy: "CreatedAt",
      isDescending: sortOrder === "DESC",
    }),
    [deferredSearch, role, status, page, sortOrder],
  );

  const {
    data: pagedUsers,
    isLoading,
    isFetching,
    refetch,
  } = useUsers(params);

  const users = useMemo(() => pagedUsers?.items ?? [], [pagedUsers?.items]);
  const totalCount = pagedUsers?.totalCount ?? 0;
  const totalPages = pagedUsers?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const stats = useMemo(() => {
    const activeOnPage = users.filter((user) => user.isActive).length;
    const inactiveOnPage = users.length - activeOnPage;

    return {
      total: totalCount,
      activeOnPage,
      inactiveOnPage,
      currentPage: page,
    };
  }, [page, totalCount, users]);

  const hasActiveFilters =
    search.trim() !== "" ||
    role !== "ALL" ||
    status !== "ALL" ||
    sortOrder !== "DESC";

  const activeFilterCount = [
    search.trim() !== "",
    role !== "ALL",
    status !== "ALL",
    sortOrder !== "DESC",
  ].filter(Boolean).length;

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast.success("User created", "The new user has been added successfully.");
      setIsModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error("Create failed", getErrorMessage(error, "Unable to create user."));
    },
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      toast.success("User updated", "User information has been updated.");
      setIsModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error("Update failed", getErrorMessage(error, "Unable to update user."));
    },
  });

  const updateStatusMutation = useUpdateUserStatus({
    onSuccess: (updatedUser) => {
      toast.success(
        "Status updated",
        `${updatedUser.fullName || updatedUser.email || "User"} is now ${updatedUser.isActive ? "active" : "de-activated"}.`,
      );
      setActionLoadingId(null);
    },
    onError: (error) => {
      toast.error("Status update failed", getErrorMessage(error, "Unable to update user status."));
      setActionLoadingId(null);
    },
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      toast.success("User deleted", "The user has been removed.");
      setActionLoadingId(null);
    },
    onError: (error) => {
      toast.error("Delete failed", getErrorMessage(error, "Unable to delete user."));
      setActionLoadingId(null);
    },
  });

  const handleResetFilters = () => {
    setSearch("");
    setRole("ALL");
    setStatus("ALL");
    setSortOrder("DESC");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserListItem) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: UserFormValues) => {
    if (modalMode === "create") {
      await createUserMutation.mutateAsync(
        mapUserFormValuesToCreateRequest(values),
      );
      return;
    }

    if (!selectedUser?.id) {
      toast.error("Update failed", "Unable to determine which user to update.");
      return;
    }

    await updateUserMutation.mutateAsync({
      id: selectedUser.id,
      payload: mapUserFormValuesToUpdateRequest(values),
    });
  };

  const handleToggleStatus = async (user: UserListItem) => {
    const nextActive = !user.isActive;
    const actionLabel = nextActive ? "activate" : "de-activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} ${user.fullName || user.email || "this user"}?`,
      )
    ) {
      return;
    }

    setActionLoadingId(user.id);
    await updateStatusMutation.mutateAsync({
      id: user.id,
      isActive: nextActive,
    });
  };

  const handleDelete = async (user: UserListItem) => {
    if (
      !window.confirm(
        `Delete ${user.fullName || user.email || "this user"} permanently?`,
      )
    ) {
      return;
    }

    setActionLoadingId(user.id);
    await deleteUserMutation.mutateAsync(user.id);
  };

  const modalLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/20 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-sky-900/5 dark:to-cyan-900/5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-500/20">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    User Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage user list, role, status, and account lifecycle.
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
                  <UserPlus className="h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <ReportStatCard
                label="Total Users"
                value={stats.total}
                icon={<Users className="h-5 w-5" />}
                color="blue"
              />
              <ReportStatCard
                label="Active On Page"
                value={stats.activeOnPage}
                icon={<UserCog className="h-5 w-5" />}
                color="emerald"
              />
              <ReportStatCard
                label="De-activated On Page"
                value={stats.inactiveOnPage}
                icon={<X className="h-5 w-5" />}
                color="amber"
              />
              <ReportStatCard
                label="Current Page"
                value={stats.currentPage}
                icon={<Filter className="h-5 w-5" />}
                color="purple"
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
                    User Filters
                  </h3>
                </div>

                {hasActiveFilters && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {role !== "ALL" && (
                  <span className="hidden rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 md:inline-flex dark:bg-slate-700/50 dark:text-slate-200">
                    {getRoleLabel(role)}
                  </span>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleResetFilters();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <X className="h-3 w-3" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                <UserManagementFilters
                  search={search}
                  role={role}
                  status={status}
                  sortOrder={sortOrder}
                  onSearchChange={(value) => {
                    setSearch(value);
                  }}
                  onRoleChange={(value) => {
                    setRole(value);
                  }}
                  onStatusChange={(value) => {
                    setStatus(value);
                  }}
                  onSortOrderChange={(value) => {
                    setSortOrder(value);
                  }}
                  onReset={handleResetFilters}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          {loading && users.length === 0 ? (
            <LoadingSkeleton />
          ) : users.length === 0 ? (
            <EmptyState
              title="No Users Found"
              description={
                hasActiveFilters
                  ? "No users match your current filters. Try changing search, role or status."
                  : "No users are available yet. Create a new user to get started."
              }
              icon={<EmptyIcon />}
              onReset={hasActiveFilters ? handleResetFilters : undefined}
            />
          ) : (
            <div className="overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      User Directory ({totalCount})
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Search by ID, name, or email. Filter by role, created time, and status.
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
                      {users.length} user(s) on this page
                    </span>
                  </div>
                </div>
              </div>

              <UserManagementTable
                rows={users}
                loading={loading}
                page={page}
                totalPages={Math.max(totalPages, 1)}
                totalCount={totalCount}
                onPageChange={setPage}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                actionLoadingId={actionLoadingId}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <UserFormModal
          key={`${modalMode}:${selectedUser?.id ?? "new"}`}
          isOpen={isModalOpen}
          mode={modalMode}
          user={selectedUser}
          isLoading={modalLoading}
          onClose={() => {
            if (modalLoading) {
              return;
            }
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
