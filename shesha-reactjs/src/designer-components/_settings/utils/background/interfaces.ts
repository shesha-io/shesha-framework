import { IConfigurableFormComponent } from "@/providers";

type BackgroundImageFile = {
  uid: string;
  name: string;
  url: string;
};

/**
 * A gradient's colour stops, in render order.
 *
 * This is an array rather than a keyed object so that overriding an inherited gradient (theme,
 * parent component, or a less specific device breakpoint) replaces the stops outright instead of
 * merging them together — `deepMergeValues` assigns arrays as-is. It also makes stop order explicit
 * rather than dependent on object key ordering.
 */
export interface IGradientValue {
  direction: string;
  colors?: string[] | undefined;
}

export interface IBackgroundValue {
  type?: 'color' | 'url' | 'image' | 'storedFile' | 'gradient' | undefined;
  size?: 'cover' | 'contain' | 'auto' | string | undefined;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | string | undefined;
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'round' | undefined;
  gradient?: IGradientValue | undefined;
  color?: string | undefined;
  url?: string | undefined;
  uploadFile?: BackgroundImageFile | undefined;
  storedFile?: { id: string } | undefined;
}

export interface IBackgroundProps extends IConfigurableFormComponent {
  onChange?: (value: IBackgroundValue) => void;
  value?: IBackgroundValue;
}

export interface IRadioOption {
  value: string | number;
  icon?: React.ReactNode;
  title?: string;
}

export interface IDropdownOption {
  label: string | React.ReactNode;
  value: string | number | null;
}
