export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ConfirmOTP: { email: string };
  Main: undefined;
  Home: undefined

};

export type DrawerParamList = {
  Home: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList, DrawerParamList {}
  }
}
