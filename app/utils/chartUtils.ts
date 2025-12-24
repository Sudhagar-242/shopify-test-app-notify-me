// Chart color palette
export const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 75)',
  blue: 'rgb(54, 162, 235)',
  indigo: 'rgb(75, 0, 130)',
  purple: 'rgb(153, 102, 255)',
  pink: 'rgb(255, 192, 203)',
};

// Month names
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Day names
const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Generate month labels
 */
export const months = (config: { count: number }): string[] => {
  const { count } = config;
  const labels = [];
  for (let i = 0; i < count; i++) {
    labels.push(MONTHS[i % MONTHS.length]);
  }
  return labels;
};

/**
 * Generate random numbers within a range
 */
export const numbers = (config: { count: number; min: number; max: number }): number[] => {
  const { count, min, max } = config;
  const nums = [];
  for (let i = 0; i < count; i++) {
    nums.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return nums;
};

/**
 * Transparentize a color
 */
export const transparentize = (color: string, alpha: number): string => {
  // Convert rgb(r, g, b) to rgba(r, g, b, alpha)
  const rgbMatch = color.match(/\d+/g);
  if (rgbMatch && rgbMatch.length === 3) {
    return `rgba(${rgbMatch[0]}, ${rgbMatch[1]}, ${rgbMatch[2]}, ${alpha})`;
  }
  return color;
};

/**
 * Generate random color
 */
export const randomColor = (): string => {
  const colors = Object.values(CHART_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Format date to string
 */
export const formatDate = (date: Date, format: string = 'MMM DD'): string => {
  const monthShort = MONTHS[date.getMonth()].substring(0, 3);
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return format
    .replace('MMM', monthShort)
    .replace('DD', day)
    .replace('YYYY', String(year));
};

/**
 * Generate date labels
 */
export const dateLables = (config: { count: number }): string[] => {
  const { count } = config;
  const labels = [];
  const today = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(formatDate(date));
  }

  return labels;
};

/**
 * Lighten a color
 */
export const lighten = (color: string, amount: number): string => {
  const rgbMatch = color.match(/\d+/g);
  if (rgbMatch && rgbMatch.length >= 3) {
    const r = Math.min(255, Math.floor(parseInt(rgbMatch[0]) + amount));
    const g = Math.min(255, Math.floor(parseInt(rgbMatch[1]) + amount));
    const b = Math.min(255, Math.floor(parseInt(rgbMatch[2]) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  }
  return color;
};

/**
 * Darken a color
 */
export const darken = (color: string, amount: number): string => {
  return lighten(color, -amount);
};

export default {
  CHART_COLORS,
  months,
  numbers,
  transparentize,
  randomColor,
  formatDate,
  dateLables,
  lighten,
  darken,
};
