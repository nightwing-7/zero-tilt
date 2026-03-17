import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop, Polygon, Rect } from 'react-native-svg';

interface RankBadgeProps {
  rank: string;
  size?: number;
}

const SparkBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#fb923c" stopOpacity="1" />
        <Stop offset="100%" stopColor="#f97316" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L14.5 8.5H21.5L16 13L18.5 19.5L12 15L5.5 19.5L8 13L2.5 8.5H9.5L12 2Z"
      fill="url(#sparkGradient)"
    />
  </Svg>
);

const EmberBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="emberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#f97316" stopOpacity="1" />
        <Stop offset="100%" stopColor="#ea580c" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2C12 2 8 8 8 12C8 15.3137 9.79086 18 12 18C14.2091 18 16 15.3137 16 12C16 8 12 2 12 2Z"
      fill="url(#emberGradient)"
    />
    <Path
      d="M12 6C12 6 10 8 10 10C10 11.6569 10.8954 13 12 13C13.1046 13 14 11.6569 14 10C14 8 12 6 12 6Z"
      fill="white"
      opacity="0.3"
    />
  </Svg>
);

const BronzeBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#b45309" stopOpacity="1" />
        <Stop offset="100%" stopColor="#92400e" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L17 6V16C17 19.3137 14.7614 22 12 22C9.23858 22 7 19.3137 7 16V6L12 2Z"
      fill="url(#bronzeGradient)"
      stroke="#78350f"
      strokeWidth="0.5"
    />
    <Path
      d="M10 8H14"
      stroke="white"
      strokeWidth="1"
      opacity="0.4"
    />
  </Svg>
);

const IronBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="ironGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#4b5563" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1f2937" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L17 6V16C17 19.3137 14.7614 22 12 22C9.23858 22 7 19.3137 7 16V6L12 2Z"
      fill="url(#ironGradient)"
      stroke="#111827"
      strokeWidth="0.5"
    />
    <Path
      d="M11 9L13 14M10 13L14 9"
      stroke="white"
      strokeWidth="1"
      opacity="0.5"
    />
  </Svg>
);

const SilverBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#e5e7eb" stopOpacity="1" />
        <Stop offset="100%" stopColor="#d1d5db" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L17 6V16C17 19.3137 14.7614 22 12 22C9.23858 22 7 19.3137 7 16V6L12 2Z"
      fill="url(#silverGradient)"
      stroke="#9ca3af"
      strokeWidth="0.5"
    />
    <Path
      d="M12 6L10 10L12 13L14 10L12 6Z"
      fill="white"
      opacity="0.6"
    />
  </Svg>
);

const GoldBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
        <Stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L17 6V16C17 19.3137 14.7614 22 12 22C9.23858 22 7 19.3137 7 16V6L12 2Z"
      fill="url(#goldGradient)"
      stroke="#d97706"
      strokeWidth="0.5"
    />
    <Path
      d="M9 8L12 7L15 8L14 11L12 12L10 11L9 8Z"
      fill="white"
      opacity="0.4"
    />
  </Svg>
);

const PlatinumBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="platinumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
        <Stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L17 6V16C17 19.3137 14.7614 22 12 22C9.23858 22 7 19.3137 7 16V6L12 2Z"
      fill="url(#platinumGradient)"
      stroke="#0369a1"
      strokeWidth="0.5"
    />
    <Circle cx="12" cy="11" r="2" fill="white" opacity="0.5" />
    <Path
      d="M10 8L14 14M14 8L10 14"
      stroke="white"
      strokeWidth="0.8"
      opacity="0.4"
    />
  </Svg>
);

const DiamondBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Polygon
      points="12,2 18,8 18,16 12,22 6,16 6,8"
      fill="url(#diamondGradient)"
      stroke="#1e40af"
      strokeWidth="0.5"
    />
    <Polygon
      points="12,5 15,8 15,14 12,17 9,14 9,8"
      fill="white"
      opacity="0.2"
    />
  </Svg>
);

const MasterBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="masterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
        <Stop offset="100%" stopColor="#7e22ce" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L17 6V16C17 19.3137 14.7614 22 12 22C9.23858 22 7 19.3137 7 16V6L12 2Z"
      fill="url(#masterGradient)"
      stroke="#6b21a8"
      strokeWidth="0.5"
    />
    <Path
      d="M12 4L13.5 6H10.5L12 4Z"
      fill="white"
      opacity="0.6"
    />
    <Path
      d="M10 13L12 17L14 13"
      fill="white"
      opacity="0.4"
    />
  </Svg>
);

const EliteBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="eliteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
        <Stop offset="100%" stopColor="#b91c1c" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L18 5L20 12L18 19L12 22L6 19L4 12L6 5L12 2Z"
      fill="url(#eliteGradient)"
      stroke="#7f1d1d"
      strokeWidth="0.5"
    />
    <Path
      d="M12 6L15 9L16 12L15 15L12 18L9 15L8 12L9 9L12 6Z"
      fill="white"
      opacity="0.2"
    />
  </Svg>
);

const TitanBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="titanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6b7280" stopOpacity="1" />
        <Stop offset="100%" stopColor="#1f2937" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L18 5L20 12L18 19L12 22L6 19L4 12L6 5L12 2Z"
      fill="url(#titanGradient)"
      stroke="#111827"
      strokeWidth="0.5"
    />
    <Path
      d="M12 10L14 8L16 12L14 16L12 14L10 16L8 12L10 8L12 10Z"
      fill="white"
      opacity="0.5"
    />
  </Svg>
);

const ImmortalBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="immortalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
        <Stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L18 5L20 12L18 19L12 22L6 19L4 12L6 5L12 2Z"
      fill="url(#immortalGradient)"
      stroke="#5b21b6"
      strokeWidth="0.5"
    />
    <Circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
    <Path
      d="M12 8L12 4M12 20L12 16"
      stroke="white"
      strokeWidth="1"
      opacity="0.5"
    />
  </Svg>
);

const LegendBadge: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="legendGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
        <Stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
        <Stop offset="100%" stopColor="#ea580c" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="legendGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
        <Stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
        <Stop offset="100%" stopColor="#10b981" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L18 5L20 12L18 19L12 22L6 19L4 12L6 5L12 2Z"
      fill="url(#legendGradient1)"
      stroke="url(#legendGradient2)"
      strokeWidth="0.8"
    />
    <Circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
    <Path
      d="M12 7L14 9L13 12L14 15L12 17L10 15L11 12L10 9L12 7Z"
      fill="white"
      opacity="0.4"
    />
  </Svg>
);

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 48 }) => {
  switch (rank.toLowerCase()) {
    case 'spark':
      return <SparkBadge size={size} />;
    case 'ember':
      return <EmberBadge size={size} />;
    case 'bronze':
      return <BronzeBadge size={size} />;
    case 'iron':
      return <IronBadge size={size} />;
    case 'silver':
      return <SilverBadge size={size} />;
    case 'gold':
      return <GoldBadge size={size} />;
    case 'platinum':
      return <PlatinumBadge size={size} />;
    case 'diamond':
      return <DiamondBadge size={size} />;
    case 'master':
      return <MasterBadge size={size} />;
    case 'elite':
      return <EliteBadge size={size} />;
    case 'titan':
      return <TitanBadge size={size} />;
    case 'immortal':
      return <ImmortalBadge size={size} />;
    case 'legend':
      return <LegendBadge size={size} />;
    default:
      return <SparkBadge size={size} />;
  }
};
