import React, {
  CSSProperties,
  FC,
  PropsWithChildren,
  ReactNode,
  useMemo
  } from 'react';
import { Button } from 'antd';
import { FormIdentifier } from '@/interfaces';
import { useShaRouting } from '@/providers/shaRouting';

export interface IShaLinkProps {
  linkTo?: string;
  icon?: ReactNode;

  linkToForm?: FormIdentifier;

  params?: any;

  /**
   * @deprecated - pass children instead
   */
  displayName?: string;

  className?: string;

  style?: CSSProperties;
}

export const ShaLink: FC<PropsWithChildren<IShaLinkProps>> = ({
  linkTo,
  linkToForm,
  params,
  icon,
  displayName,
  children,
  className,
  style,
}) => {
  const { router, getFormUrl } = useShaRouting();

  const paramsStr = useMemo(() => {
    if (!params) return undefined;
    var str = [];
    for (const key of Object.keys(params)) str.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    return str.join('&');
  }, [params]);

  const url = (linkTo ?? getFormUrl(linkToForm)) + (paramsStr ? `?${paramsStr}` : '');

  const changeRoute = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();

    if (url) router?.push(url /*.toLowerCase() - it causes problems on prod because of case sensitivity of routings!*/);
  };

  const childrenOrDisplayText = children || displayName;

  return (
    <Button type="link" onClick={changeRoute} href={url} className={className} style={style}>
      {icon}
      {childrenOrDisplayText && <span> {childrenOrDisplayText}</span>}
    </Button>
  );
};

export default ShaLink;
