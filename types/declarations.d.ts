declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { StyleProp, ViewStyle, TextStyle } from 'react-native';

  export interface PickerProps {
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    style?: StyleProp<ViewStyle | TextStyle>;
    enabled?: boolean;
    mode?: 'dialog' | 'dropdown';
    dropdownIconColor?: string;
    testID?: string;
    itemStyle?: StyleProp<TextStyle>;
  }

  export interface PickerItemProps {
    label: string;
    value: any;
    color?: string;
    testID?: string;
  }

  export class PickerItem extends React.Component<PickerItemProps> {}
  export class Picker extends React.Component<PickerProps> {
    static Item: typeof PickerItem;
  }
}

declare module '@react-native-community/datetimepicker';

declare module 'react-native-modal-datetime-picker';
