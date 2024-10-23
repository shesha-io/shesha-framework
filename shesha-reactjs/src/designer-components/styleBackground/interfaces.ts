import { IConfigurableFormComponent } from "@/providers";

export interface IBackgroundValue {
    type: 'color' | 'url' | 'upload' | 'storedFile' | 'gradient';
    size?: 'cover' | 'contain' | 'auto' | string;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | string;
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    gradient?: { direction: string, colors: {} };
    color?: string;
    url?: string;
    file?: any;
    storedFile?: { id: string, ownerId: string, fileCatergory: string, ownerType: string };
}

export interface IBackgroundProps extends IConfigurableFormComponent {
    onChange?: (value: IBackgroundValue) => void;
    value?: IBackgroundValue;
}