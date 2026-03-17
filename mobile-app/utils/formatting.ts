export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatStreakText(days: number): string {
  if (days === 0) {
    return 'No streak';
  } else if (days === 1) {
    return '1 day streak';
  } else {
    return `${days} day streak`;
  }
}

export function getRankFromPoints(points: number): string {
  if (points < 500) {
    return 'Bronze';
  } else if (points < 1500) {
    return 'Silver';
  } else if (points < 3000) {
    return 'Gold';
  } else if (points < 5000) {
    return 'Platinum';
  } else {
    return 'Diamond';
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${secs}s`;
    }
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
}

export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatIntensity(intensity: number): string {
  const emojis = ['😌', '😐', '😟', '😠', '🔥', '🤬', '💢', '⚡', '🌋', '💥'];
  if (intensity < 1 || intensity > 10) {
    return '?';
  }
  return emojis[intensity - 1];
}

export function getIntensityLabel(intensity: number): string {
  if (intensity <= 2) return 'Low';
  if (intensity <= 4) return 'Mild';
  if (intensity <= 6) return 'Moderate';
  if (intensity <= 8) return 'High';
  return 'Critical';
}

export function formatMoodLabel(mood: string): string {
  const labels: Record<string, string> = {
    terrible: 'Terrible',
    poor: 'Poor',
    neutral: 'Neutral',
    good: 'Good',
    excellent: 'Excellent',
  };
  return labels[mood] || mood;
}

export function formatOutcomeLabel(outcome: string): string {
  const labels: Record<string, string> = {
    'Resisted': '✓ Resisted',
    'Gave in': '✗ Gave in',
    'Distracted': '↻ Distracted',
  };
  return labels[outcome] || outcome;
}

export function getOutcomeColor(outcome: string): string {
  switch (outcome) {
    case 'Resisted':
      return '#10b981';
    case 'Gave in':
      return '#ef4444';
    case 'Distracted':
      return '#f59e0b';
    default:
      return '#64748b';
  }
}

export function formatWordCount(words: number): string {
  if (words < 1000) {
    return `${words}`;
  } else if (words < 1000000) {
    return `${(words / 1000).toFixed(1)}K`;
  } else {
    return `${(words / 1000000).toFixed(1)}M`;
  }
}

export function getProgressPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((current / total) * 100, 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
