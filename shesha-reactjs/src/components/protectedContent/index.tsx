import { Fragment, FC, ReactNode } from 'react';
import { useSheshaApplication } from '@/providers';

export interface IProtectedContentProps {
  permissionName: string;
  children?: ReactNode;
}

export const ProtectedContent: FC<IProtectedContentProps> = ({ permissionName, children }) => {
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const hasRights = !permissionName || anyOfPermissionsGranted([permissionName]);

  return hasRights ? <Fragment>{children}</Fragment> : null;
};

export default ProtectedContent;
