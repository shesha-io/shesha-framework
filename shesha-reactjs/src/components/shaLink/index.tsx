import React, { FC, ReactNode } from 'react';
import { useShaRouting } from '../../providers/shaRouting';

export interface IShaLinkProps {
  linkTo?: string;
  icon?: ReactNode;

  /**
   * @deprecated - pass children instead
   */
  displayName?: string;
}

export const ShaLink: FC<IShaLinkProps> = ({ linkTo, icon, displayName, children }) => {
  const { router } = useShaRouting();

  const changeRoute = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    if (linkTo) {
      router?.push(linkTo /*.toLowerCase() - it causes problems on prod because of case sensitivity of routings!*/);
    }
  };

  const childrenOrDisplayText = children || displayName;

  return (
    <a className="sha-link" onClick={changeRoute} href={linkTo}>
      {icon}
      {childrenOrDisplayText && <span> {childrenOrDisplayText}</span>}
    </a>
  );
};

export default ShaLink;
