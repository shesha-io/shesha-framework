import { ReactNode } from 'react';

export interface IDesktopNotificationOptions {
  title: string;
  body: string | ReactNode;
  data: string;
}
