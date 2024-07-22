import { IConfigurableFormComponent } from "@/providers";

export interface IBackgroundValue {
    type: 'color' | 'url' | 'upload' | 'base64' | 'gradient';
    size?: 'cover' | 'contain' | 'auto' | { width: { value: number, unit: string }, height: { value: number, unit: string } };
    position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right' | { width: { value: number, unit: string }, height: { value: number, unit: string } };
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    gradient?: { direction: string, colors: string[] };
    color?: string;
    url?: string;
    fileId?: string;
    base64?: string;
}

export interface IBackgroundProps extends IConfigurableFormComponent {
    onChange?: (value: IBackgroundValue) => void;
    value?: IBackgroundValue;
}