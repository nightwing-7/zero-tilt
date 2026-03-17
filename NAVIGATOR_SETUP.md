# Navigator Setup Guide for Profile & Settings Screens

## Import Statements

```typescript
import { ProfileScreen } from './src/screens/main';
import {
  EditProfileScreen,
  NotificationsScreen,
  SubscriptionScreen,
  PrivacyScreen,
  HelpScreen,
} from './src/screens/settings';
```

## React Navigation Stack Configuration

Add these route definitions to your Stack Navigator:

```typescript
// In your main navigation file
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
      />
    </Stack.Navigator>
  );
}
```

## Navigation Flow

```
Profile Screen
├── Navigation -> Settings (via gear icon)
├── Navigation -> EditProfile
├── Navigation -> Notifications
├── Navigation -> Subscription
├── Navigation -> Privacy
├── Navigation -> Help
└── Share (via share icon)

All Settings Screens
├── Back arrow navigation to parent
└── Links between settings options
```

## Zustand Store Usage

Access user data from any component:

```typescript
import { useStore } from './src/store/store';

function MyComponent() {
  const { name, traderName, streak, currentRank } = useStore();
  
  // name: string
  // traderName: string
  // email: string
  // streak: number
  // currentRank: number
  
  return (
    <Text>{traderName} - {streak} day streak</Text>
  );
}
```

Update user data:

```typescript
const { setName, setTraderName, setStreak, setCurrentRank, setEmail } = useStore();

setName('New Name');
setTraderName('NewHandle');
setStreak(50);
setCurrentRank(8);
setEmail('new@example.com');
```

## Required Dependencies

Ensure these are installed in your project:

```bash
npm install zustand expo-linear-gradient react-native-svg
# or
yarn add zustand expo-linear-gradient react-native-svg
```

## Styling System

All screens use:
- `StyleSheet.create()` for styles
- Color palette defined in theme:
  - Primary: #10b981
  - Background: #111113
  - Text: white
  - Secondary text: #9CA3AF
  - Borders: #2a2a2d
  - Gradients: #8B5CF6 to #6366F1

No external UI library needed - all components use React Native core.

## TypeScript Types

All screens properly typed with:
- Component props
- Navigation params
- State management
- Event handlers

No `any` types used except for navigation prop (standard practice).

## Testing Considerations

Each screen includes:
- Default state/mock data
- User interaction handlers
- Alert confirmations for destructive actions
- Proper error handling

Mock data included:
- 10 traders per leaderboard
- 3 subscription plans
- 8 notification options
- 5 FAQ items
- Multiple profile toggles

## Accessibility Notes

- Touch targets minimum 44px
- Text contrast meets WCAG standards
- Interactive elements clearly labeled
- Hierarchical navigation with back buttons
- Alert confirmations for destructive actions

## Performance Optimizations

- Uses ScrollView for content-heavy screens
- Lazy rendering of leaderboard items
- Efficient state management with Zustand
- No unnecessary re-renders
- SVG avatars (lightweight)

## Known Limitations

- Sharing currently uses native Share sheet (no custom implementation)
- Email links require device to have email client configured
- External links use native Linking API
- All data is mock data - integrate with backend as needed

## Next Steps

1. Install dependencies
2. Add screens to your navigator
3. Configure navigation stack
4. Test navigation flow
5. Integrate with actual backend API
6. Connect to real Zustand store actions
7. Add analytics/tracking
