import React, { CSSProperties, FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { Button } from 'antd';
import { FormIdentifier } from '@/interfaces';
import { useShaRouting } from '@/providers/shaRouting';
import { useStyles } from './styles/styles';
import { isDefined } from '@/utils/nullables';

export interface IShaLinkProps {
  linkTo?: string;
  icon?: ReactNode;

  linkToForm?: FormIdentifier;

  params?: any;

  className?: string;

  style?: CSSProperties;

  disabled?: boolean;
}

export const ShaLink: FC<PropsWithChildren<IShaLinkProps>> = ({
  linkTo,
  linkToForm,
  params,
  icon,
  children,
  className,
  style,
  disabled,
}) => {
  const { router, getFormUrl } = useShaRouting();
  const { styles, cx } = useStyles();

  const paramsStr = useMemo(() => {
    if (!params) return undefined;
    const str = [];
    for (const key of Object.keys(params)) str.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    return str.join('&');
  }, [params]);

  const url = (linkTo ?? getFormUrl(linkToForm)) + (paramsStr ? `?${paramsStr}` : '');

  const changeRoute = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    event.preventDefault();

    if (url) router?.push(url /* .toLowerCase() - it causes problems on prod because of case sensitivity of routings!*/);
  };

  return (
    <Button
      type="link"
      onClick={changeRoute}
      href={url}
      className={cx(styles.innerEntityReferenceButtonBoxStyle, className)}
      style={style}
      disabled={disabled}
    >
      {icon}
      {isDefined(children) && <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>{children}</span>}
    </Button>
  );
};

export default ShaLink;
