import { Platform } from 'react-native';

export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#1B2D5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
});

export const CardShadowElevated = Platform.select({
  ios: {
    shadowColor: '#1B2D5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  android: {
    elevation: 6,
  },
});

export const CardSurfaceClip = Platform.select({
  android: { overflow: 'hidden' as const },
  default: {},
});
