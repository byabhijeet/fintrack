import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,

  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { useSplitGroups, useAddGroupMutation } from '../../lib/queries/splits';
import { Plus, Users, ChevronRight, Home, Plane, Briefcase, Heart, FileText } from 'lucide-react-native';

export default function SplitScreen() {
  const router = useRouter();
  const { data: groups, isLoading } = useSplitGroups();
  const addGroupMutation = useAddGroupMutation();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'trip' | 'home' | 'office' | 'couple' | 'other'>('other');

  const groupTypes = [
    { label: 'Home', value: 'home', icon: Home },
    { label: 'Trip', value: 'trip', icon: Plane },
    { label: 'Office', value: 'office', icon: Briefcase },
    { label: 'Couple', value: 'couple', icon: Heart },
    { label: 'Other', value: 'other', icon: FileText },
  ] as const;

  const handleAddGroup = async () => {
    if (!groupName.trim()) return;

    try {
      await addGroupMutation.mutateAsync({
        name: groupName,
        type: groupType,
        cover_color: getColorForType(groupType),
      });
      setGroupName('');
      setGroupType('other');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const getColorForType = (type: string) => {
    const colors: Record<string, string> = {
      trip: '#FF6B6B',
      home: '#4ECDC4',
      office: '#45B7D1',
      couple: '#FFA07A',
      other: '#95E1D3',
    };
    return colors[type] || colors.other;
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 24, color: theme.colors.textPrimary };
    const icons: Record<string, React.ReactNode> = {
      trip: <Plane {...iconProps} />,
      home: <Home {...iconProps} />,
      office: <Briefcase {...iconProps} />,
      couple: <Heart {...iconProps} />,
      other: <FileText {...iconProps} />,
    };
    return icons[type] || <FileText {...iconProps} />;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Split Bill</Text>
            <Text style={styles.subtitle}>Groups & Penny-Perfect Splits</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color={theme.colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        {groups && groups.length > 0 ? (
          <View style={styles.groupsList}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupCard,
                  { borderLeftColor: group.cover_color || theme.colors.primary, borderLeftWidth: 4 },
                ]}
                onPress={() => router.push(`/(app)/(split)/${group.id}`)}
              >
                <View style={styles.groupCardContent}>
                  <View style={styles.groupIcon}>{getTypeIcon(group.type)}</View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupType}>{group.type.toUpperCase()}</Text>
                  </View>
                </View>
                <ChevronRight color={theme.colors.textSecondary} size={24} style={{ marginLeft: theme.spacing.md }} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Users size={48} color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.md }} />
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptyText}>
              Create a group to start splitting expenses with friends
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Group Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Group</Text>

            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Europe Trip"
              placeholderTextColor={theme.colors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeGrid}>
              {groupTypes.map((type) => {
                const IconComponent = type.icon;
                const isActive = groupType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      isActive && styles.typeButtonActive,
                    ]}
                    onPress={() => setGroupType(type.value)}
                  >
                    <IconComponent
                      size={20}
                      color={isActive ? '#000' : theme.colors.textPrimary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.typeButtonText, isActive && { color: '#000' }]}>{type.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleAddGroup}
                disabled={!groupName.trim() || addGroupMutation.isPending}
              >
                <Text style={styles.createButtonText}>
                  {addGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  groupsList: {
    gap: theme.spacing.md,
  },
  groupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  groupCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  groupType: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  groupArrow: {
    marginLeft: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  typeButton: {
    flex: 0.48,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  createButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
});
