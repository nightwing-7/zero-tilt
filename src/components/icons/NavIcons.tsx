import React from 'react';
import Svg, { Path, Circle, G, Rect, Line, Polyline } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12.5C3 10.6144 3 9.67157 3.58579 9.08579C4.17157 8.5 5.11438 8.5 7 8.5H17C18.8856 8.5 19.8284 8.5 20.4142 9.08579C21 9.67157 21 10.6144 21 12.5V17C21 18.8856 21 19.8284 20.4142 20.4142C19.8284 21 18.8856 21 17 21H7C5.11438 21 4.17157 21 3.58579 20.4142C3 19.8284 3 18.8856 3 17V12.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V14C9 12.8954 9.89543 12 11 12H13C14.1046 12 15 12.8954 15 14V21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 3L3.5 9.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 3L20.5 9.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AnalyticsIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21H21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="5,15 9,10 13,13 19,5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="5" cy="15" r="2" fill={color} />
    <Circle cx="9" cy="10" r="2" fill={color} />
    <Circle cx="13" cy="13" r="2" fill={color} />
    <Circle cx="19" cy="5" r="2" fill={color} />
  </Svg>
);

export const CommunityIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G>
      <Circle cx="12" cy="9" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M5.5 18C5.5 15.5147 8.13401 13.5 12 13.5C15.866 13.5 18.5 15.5147 18.5 18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="4" cy="10" r="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M2.5 18C2.5 16.1591 3.34629 14.6 4.5 13.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="20" cy="10" r="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M21.5 18C21.5 16.1591 20.6537 14.6 19.5 13.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

export const JournalIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3H17C18.8856 3 19.8284 3 20.4142 3.58579C21 4.17157 21 5.11438 21 7V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V7C3 5.11438 3 4.17157 3.58579 3.58579C4.17157 3 5.11438 3 7 3Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M9 7V3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M15 7V3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M7 13H17"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M7 17H14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M9 9H7M11 9H15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <Path
      d="M6 21C6 17.134 8.68629 14 12 14C15.3137 14 18 17.134 18 21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <G>
      <Path
        d="M19 6C20.6569 6 22 4.65685 22 3C22 1.34315 20.6569 0 19 0C17.3431 0 16 1.34315 16 3C16 4.65685 17.3431 6 19 6Z"
        fill={color}
      />
      <Path
        d="M20 2.5L18.5 4L19.5 5"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);
