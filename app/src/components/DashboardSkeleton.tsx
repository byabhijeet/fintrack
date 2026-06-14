import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { theme } from '../theme';

const SkeletonItem = ({ style }: { style?: any }) => (
  <View style={[styles.skeleton, style]} />
);

export default function DashboardSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
      <View style={styles.headerRow}>
        <View>
          <SkeletonItem style={styles.titleSkeleton} />
          <SkeletonItem style={styles.subtitleSkeleton} />
        </View>
        <SkeletonItem style={styles.circleSkeleton} />
      </View>

      <SkeletonItem style={styles.netCardSkeleton} />

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <SkeletonItem style={[styles.cardSkeleton, { flex: 1 }]} />
        <SkeletonItem style={[styles.cardSkeleton, { flex: 1 }]} />
      </View>

      <SkeletonItem style={styles.chartSkeleton} />

      <SkeletonItem style={styles.sectionTitleSkeleton} />
      <View style={styles.actionsGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonItem key={i} style={styles.gridButtonSkeleton} />
        ))}
      </View>

      <SkeletonItem style={[styles.sectionTitleSkeleton, { marginTop: theme.spacing.xl }]} />
      <View style={styles.activityList}>
        {[1, 2, 3].map((i) => (
          <SkeletonItem key={i} style={styles.activityItemSkeleton} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
  },
  skeleton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  titleSkeleton: {
    width: 150,
    height: 32,
    marginBottom: theme.spacing.xs,
  },
  subtitleSkeleton: {
    width: 220,
    height: 16,
  },
  circleSkeleton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
  },
  netCardSkeleton: {
    width: '100%',
    height: 140,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  cardSkeleton: {
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  chartSkeleton: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitleSkeleton: {
    width: 120,
    height: 24,
    marginBottom: theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  gridButtonSkeleton: {
    width: 100,
    height: 80,
    flexGrow: 1,
    maxWidth: 240,
  },
  activityList: {
    gap: theme.spacing.md,
  },
  activityItemSkeleton: {
    width: '100%',
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
});
