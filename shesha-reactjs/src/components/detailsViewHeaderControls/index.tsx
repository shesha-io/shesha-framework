import React, { FC, ReactNode } from 'react';
import CancelButton from '../cancelButton';
import { useSheshaApplication, useShaRouting } from '../../providers';

export interface IControlItemData {
  readonly name: string;
  readonly value: ReactNode;
  readonly hide?: boolean;
  readonly permissions?: string[];
}

interface IProps {
  items: IControlItemData[];
  backUrl?: string;
}

export const DetailsViewHeaderControls: FC<IProps> = ({ items, backUrl }) => {
  const { router } = useShaRouting();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  let i = 0;

  return (
    <div className="details-view-header-list">
      <span className="details-view-header-list-container">
        {items
          .filter(({ hide, permissions }) => {
            if (permissions?.length && !anyOfPermissionsGranted(permissions)) {
              return false;
            }

            return !hide;
          })
          .map(({ name, value }) => (
            <span key={i++} className="details-view-header-container">
              <span className="details-view-header-list-item">{name}</span>
              <span className="details-view-header-list-item">{value}</span>
            </span>
          ))}
      </span>
      <span className="details-view-header-list-cancel">
        <CancelButton onCancel={() => (router ? router?.push(backUrl) : null)} />
      </span>
    </div>
  );
};

export default DetailsViewHeaderControls;
