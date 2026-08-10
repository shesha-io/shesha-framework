import React, { CSSProperties, FC, PropsWithChildren, ReactNode, useMemo } from 'react';
import { Button } from 'antd';
import { FormIdentifier } from '@/interfaces';
import { useShaRouting } from '@/providers/shaRouting';
import { useStyles } from './styles/styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { buildUrl } from '@/utils';

export interface IShaLinkProps {
  linkTo?: string | undefined;
  icon?: ReactNode | undefined;

  linkToForm?: FormIdentifier | undefined;

  params?: object | undefined;

  className?: string | undefined;

  style?: CSSProperties | undefined;

  disabled?: boolean | undefined;
}

export const ShaLink: FC<PropsWithChildren<IShaLinkProps>> = ({
  linkTo,
  linkToForm,
  params,
  icon,
  children,
  className,
  style,
  disabled = false,
}) => {
  const { router, getFormUrl } = useShaRouting();
  const { styles, cx } = useStyles();

  const formRawUrl = useMemo(() => {
    const formUrl = linkToForm ? getFormUrl(linkToForm) : undefined;
    return !isNullOrWhiteSpace(formUrl)
      ? buildUrl(formUrl, params)
      : undefined;
  }, [linkToForm, params, getFormUrl]);

  const url = linkTo ?? formRawUrl;

  const changeRoute = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    event.preventDefault();

    if (url) router.push(url);
  };

  return (
    <Button
      type="link"
      onClick={changeRoute}
      {...(url ? { href: url } : {})}
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
