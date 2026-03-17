import React from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

const colors = {
  emerald: '#10b981',
  textPrimary: '#ffffff',
};

interface TabBarProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  style?: ViewStyle;
}

const TabBar = React.forwardRef<ScrollView, TabBarProps>(
  ({ tabs, activeTab, onTabChange, style }, ref) => {
    const styles = StyleSheet.create({
      container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
      } as ViewStyle,
      scrollView: {
        flexGrow: 0,
      } as ViewStyle,
      tabsWrapper: {
        flexDirection: 'row',
        gap: 8,
      } as ViewStyle,
      tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
      } as ViewStyle,
      activeTab: {
        backgroundColor: colors.emerald,
      } as ViewStyle,
      inactiveTab: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      } as ViewStyle,
      tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        fontFamily: 'Inter',
      } as TextStyle,
    });

    return (
      <View style={[styles.container, style]}>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          <View style={styles.tabsWrapper}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={`tab-${index}`}
                style={[
                  styles.tab,
                  activeTab === index ? styles.activeTab : styles.inactiveTab,
                ]}
                onPress={() => onTabChange(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.tabText}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }
);

TabBar.displayName = 'TabBar';

export default TabBar;
export { TabBar };
