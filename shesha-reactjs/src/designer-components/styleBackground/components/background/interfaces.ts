import { IConfigurableFormComponent } from "@/providers";

export interface IBackgroundValue {
    backgroundType?: 'color' | 'url' | 'upload' | 'storedFile' | 'gradient';
    size?: 'cover' | 'contain' | 'auto' | { width: { value: number, unit: string }, height: { value: number, unit: string } };
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | { width: { value: number, unit: string }, height: { value: number, unit: string } };
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    gradient?: { direction: string, colors: string[] };
    color?: string;
    url?: string;
    file?: string;
    permissions?: string[];
    storedFile?: { id: string, ownerId: string, ownerType: any, fileCategory: string };
}

export interface IBackgroundProps extends IConfigurableFormComponent {
    onChange?: (value: IBackgroundValue) => void;
    value?: IBackgroundValue;
}