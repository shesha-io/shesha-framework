import { IConfigurableFormComponent } from "@/providers";
import { UploadFile } from "antd";

export interface IBackgroundValue {
  type: 'color' | 'url' | 'image' | 'storedFile' | 'gradient';
  size?: 'cover' | 'contain' | 'auto' | string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | string;
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'round';
  gradient?: { direction: string; colors: Record<string, string> };
  color?: string;
  url?: string;
  uploadFile?: UploadFile;
  storedFile?: { id: string };
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
  value: string;
}
