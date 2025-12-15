export const AppRoutes = {
  Counter: 'Counter',
} as const;

export type RootStackParamList = {
  [AppRoutes.Counter]: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
