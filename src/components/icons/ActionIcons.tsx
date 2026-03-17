import React from 'react';
import Svg, { Path, Circle, G, Polyline, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
}

export const PledgeIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Path
      d="M24 4L10 12V22C10 32.5 24 42 24 42C24 42 38 32.5 38 22V12L24 4Z"
      fill="#10b981"
      stroke="#059669"
      strokeWidth="1.5"
    />
    <Path
      d="M18 24L22 28L30 16"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CoachIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="20" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
    <Path
      d="M24 14V34"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M14 24H34"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M29 19L32 16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M19 29L16 32"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M29 29L32 32"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M19 19L16 16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const UrgeIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="20" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
    <Path
      d="M24 32C28.4183 32 32 28.4183 32 24C32 19.5817 28.4183 16 24 16C19.5817 16 16 19.5817 16 24C16 28.4183 19.5817 32 24 32Z"
      stroke="white"
      strokeWidth="1.5"
    />
    <Path
      d="M24 20V28"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="24" cy="24" r="12" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
    <Path
      d="M24 15V8M33 24H40M15 24H8"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const ResetIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="20" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
    <Circle cx="24" cy="24" r="12" fill="none" stroke="white" strokeWidth="1.5" />
    <Path
      d="M24 12V24L32 32"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 18L14 14M14 18L18 14"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
