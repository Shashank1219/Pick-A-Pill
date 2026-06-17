import { TextStyle } from 'react-native';

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: '700',
  } as TextStyle,
  stat: {
    fontSize: 36,
    fontWeight: '800',
  } as TextStyle,
  title: {
    fontSize: 20,
    fontWeight: '700',
  } as TextStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400',
  } as TextStyle,
  bodySemiBold: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
  } as TextStyle,
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
};

export const Radii = {
  card: 16,
  chip: 20,
  input: 12,
  button: 14,
  statCard: 12,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};
