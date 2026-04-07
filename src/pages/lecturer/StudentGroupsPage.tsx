import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersRound } from 'lucide-react';
import { useGroups, useCreateGroup } from '../../features/groups';
import GroupSearchFilter from '../../features/groups/components/GroupSearchFilter';
import GroupsGridCard from '../../features/groups/components/GroupsGridCard';
import CreateGroupModal from '../../features/groups/components/CreateGroupModal';
import type { GroupFilterState } from '../../features/groups/types/types';
import { useToast } from '../../hooks/useToast';

const StudentGroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<GroupFilterState>({
    searchQuery: '',
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const appAlert = useToast();

  // API Queries
  const { data: groupsData, isLoading: isLoadingGroups } = useGroups({
    params: {
      searchQuery: filters.searchQuery,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    },
  });

  // Mutations
  const createMutation = useCreateGroup({
    onSuccess: () => {
      appAlert.success('Success', 'Student group created successfully!');
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      appAlert.error('Error', error.message || 'Failed to create group');
    },
  });

  // Computed values
  const groups = useMemo(() => groupsData?.items || [], [groupsData]);
  // Handlers
  const handleFilterChange = useCallback((newFilters: GroupFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleCreateGroup = async (data: { name: string }) => {
    await createMutation.mutateAsync({ groupName: data.name });
  };

  const handleManageStudents = (group: { id: string }): void => {
    navigate(`/student-groups/${group.id}`);
  };

  const isLoading = isLoadingGroups || createMutation.isPending;

  const filteredGroups = useMemo(() => {
    const query = (filters.searchQuery || '').trim().toLowerCase();
    if (!query) return groups;
    return groups.filter((group) => {
      return group.groupName.toLowerCase().includes(query);
    });
  }, [groups, filters.searchQuery]);

  const handleImportGroup = () => {
    appAlert.info('Info', 'Import group feature will be available soon.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UsersRound size={32} className="text-brand-600" />
              Group Management
            </h1>
          </div>
          <p className="text-gray-600">
            Create and manage student groups for your courses
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 space-y-6">
        {/* Search & Filter Bar */}
        <GroupSearchFilter
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
          onImportGroup={handleImportGroup}
          onAddGroup={() => setShowCreateModal(true)}
        />

        {/* Available Groups Title */}
        <h2 className="text-xl font-bold text-gray-900">Available Groups</h2>

        {/* Main Layout: Grid */}
        <div className="w-full">
          {/* Groups Grid */}
          <GroupsGridCard
            groups={filteredGroups}
            isLoading={isLoadingGroups}
            onSelectGroup={handleManageStudents}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        isLoading={createMutation.isPending}
        existingGroups={groups}
      />
    </div>
  );
};

export default StudentGroupsPage;
