import type { NavigationProp, ParamListBase } from '@react-navigation/native';

export function dismissParentOrCurrent(
  navigation: NavigationProp<ParamListBase>,
): void {
  const parent = navigation.getParent();
  if (parent) {
    parent.goBack();
    return;
  }
  if (navigation.canGoBack()) {
    navigation.goBack();
  }
}
