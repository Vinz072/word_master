import { RANK_COLORS, RANK_ICONS } from '@/types';

export const getRankColor = (rank: string): string => {
  return RANK_COLORS[rank] || '#9CA3AF';
};

export const getRankIcon = (rank: string): string => {
  return RANK_ICONS[rank] || '🥉';
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateAvatarColor = (name: string): string => {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const validateWordInput = (word: string): { valid: boolean; error?: string } => {
  const trimmed = word.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Please enter a word' };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Word must be at least 2 characters' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Word is too long' };
  }
  
  if (!/^[a-zA-Z]+$/.test(trimmed)) {
    return { valid: false, error: 'Word can only contain letters' };
  }
  
  return { valid: true };
};

export const checkWordStartsWith = (word: string, pattern: string): boolean => {
  if (!pattern) return true;
  return word.toLowerCase().startsWith(pattern.toLowerCase());
};

export const getRoundName = (round: number): string => {
  switch (round) {
    case 1:
      return 'Round 1';
    case 2:
      return 'Round 2';
    case 3:
      return 'Round 3';
    default:
      return `Round ${round}`;
  }
};

export const getRoundDescription = (round: number): string => {
  switch (round) {
    case 1:
      return 'Last 1 letter';
    case 2:
      return 'Last 2 letters';
    case 3:
      return 'Last 3 letters';
    default:
      return 'Unknown round';
  }
};

export const getWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const getProgressPercentage = (current: number, target: number): number => {
  if (target <= 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
