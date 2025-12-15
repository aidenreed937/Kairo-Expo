export const AppRoutes = {
  Counter: 'Counter',
} as const;

export type RootStackParamList = {
  [AppRoutes.Counter]: undefined;
};

// React Navigation requires this pattern for type-safe navigation
/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
