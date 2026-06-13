import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import HomeScreen from '../screens/Home/HomeScreen';
import CreditBookScreen from '../screens/CreditBook/CreditBookScreen';
import SplitScreen from '../screens/Split/SplitScreen';
import HubScreen from '../screens/Hub/HubScreen';
import { theme } from '../theme';
import { Home, Book, SplitSquareHorizontal, LayoutGrid } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const color = focused ? theme.colors.primaryLight : theme.colors.textSecondary;
  const size = 24;

  let IconComponent = Home;
  if (label === 'Credit Book') IconComponent = Book;
  if (label === 'Split') IconComponent = SplitSquareHorizontal;
  if (label === 'Hub') IconComponent = LayoutGrid;

  return (
    <View style={styles.iconContainer}>
      <IconComponent color={color} size={size} />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: theme.colors.primaryLight,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.xs,
          fontWeight: theme.typography.weights.semibold,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: theme.colors.textPrimary,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.bold,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Credit Book" component={CreditBookScreen} options={{ title: 'Credit Book' }} />
      <Tab.Screen name="Split" component={SplitScreen} options={{ title: 'Split' }} />
      <Tab.Screen name="Hub" component={HubScreen} options={{ title: 'Hub' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primaryLight,
    marginTop: 4,
  },
});
