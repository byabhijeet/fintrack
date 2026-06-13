import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from '../TabNavigator';

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  return {
    enableScreens: jest.fn(),
    ScreenContainer: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
    NativeScreen: ({ children }: any) => children,
    NativeScreenContainer: ({ children }: any) => children,
    ScreenStack: ({ children }: any) => children,
    ScreenStackHeaderConfig: ({ children }: any) => children,
    ScreenStackHeaderSubview: ({ children }: any) => children,
    SearchBar: ({ children }: any) => children,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const mockInset = { top: 0, right: 0, bottom: 0, left: 0 };
  const MockSafeAreaInsetsContext = React.createContext(mockInset);
  const MockSafeAreaFrameContext = React.createContext({ x: 0, y: 0, width: 390, height: 844 });
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => mockInset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    SafeAreaInsetsContext: MockSafeAreaInsetsContext,
    SafeAreaFrameContext: MockSafeAreaFrameContext,
    SafeAreaConsumer: ({ children }: any) => children(mockInset),
  };
});

describe('TabNavigator', () => {
  it('renders all four tab screens correctly', async () => {
    await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    );

    // Should find the tab buttons / headers
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Credit Book').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Split').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hub').length).toBeGreaterThan(0);
  });
});
