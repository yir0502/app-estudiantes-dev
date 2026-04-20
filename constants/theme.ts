/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const BUAP_BLUE = '#003B5C';
const BUAP_GOLD = '#FFB81C';
const BUAP_LIGHT_BLUE = '#005483';

export const Colors = {
  light: {
    text: '#111827',
    background: '#F8FAFC',
    tint: BUAP_BLUE,
    accent: BUAP_GOLD,
    icon: '#4B5563',
    tabIconDefault: '#94A3B8',
    tabIconSelected: BUAP_GOLD,
    tabBarBackground: BUAP_BLUE,
    card: '#FFFFFF',
    headerBackground: BUAP_BLUE,
    headerText: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    accent: BUAP_GOLD,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: BUAP_GOLD,
    tabBarBackground: '#000000',
    card: '#1F2937',
    headerBackground: '#111827',
    headerText: '#FFFFFF',
  },
  buap: {
    primary: BUAP_BLUE,
    secondary: BUAP_GOLD,
    light: BUAP_LIGHT_BLUE,
  }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
