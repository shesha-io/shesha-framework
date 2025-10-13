import { Breadcrumb, Space } from 'antd';
import classNames from 'classnames';
import React, { FC, PropsWithChildren, useEffect } from 'react';
import { ShaSpin } from '..';
import Show from '@/components/show';
import { useSheshaApplication, useTheme } from '@/providers';
import StatusTag, { IStatusTagProps } from '@/components/statusTag';
import { FormIdentifier } from '@/providers/form/models';

export interface IPageHeadProps {
  readonly title?: string;
  readonly description?: string;
  readonly url?: string;
  readonly ogImage?: string;
  readonly formId?: FormIdentifier;
  readonly formMode?: string;
}

export interface IBreadcrumbItem {
  text: string;
  link?: string;
}

export interface IPageProps extends IPageHeadProps {
  backUrl?: string;
  breadcrumbItems?: IBreadcrumbItem[];
  loading?: boolean;
  noPadding?: boolean;
  loadingText?: string;
  status?: IStatusTagProps;
}

export const Page: FC<PropsWithChildren<IPageProps>> = ({
  children,
  title,
  backUrl,
  loading,
  breadcrumbItems,
  loadingText = 'Loading...',
  noPadding = false,
  status,
}) => {
  const { applicationName } = useSheshaApplication();
  const { theme } = useTheme();

  useEffect(() => {
    document.title = !!applicationName ? `${applicationName} | ${title}` : title;
    return () => {
      document.title = '';
    };
  }, [applicationName, title]);

  const hasBackUrl = !!backUrl?.trim();

  const showHeading = !!title || hasBackUrl;

  const hasStatus = Boolean(status);

  return (
    <section className="sha-page" style={{ background: theme?.layoutBackground }}>
      <ShaSpin spinning={loading || false} tip={loadingText}>
        <Show when={showHeading}>
          <div className="sha-page-heading">
            <div className="sha-page-heading-left">
              <Show when={!!title?.trim() || hasStatus}>
                <h1 className="sha-page-title">
                  <Space>
                    {title}

                    <StatusTag
                      color={status?.color}
                      value={status?.value}
                      override={status?.override}
                      mappings={status?.mappings}
                    />
                  </Space>
                </h1>
              </Show>
            </div>
          </div>
        </Show>

        <Show when={!!breadcrumbItems?.length}>
          <Breadcrumb className="sha-page-breadcrumb">
            {breadcrumbItems?.map(({ text, link }, index) => (
              <Breadcrumb.Item key={index}>{link ? <a href={link}>{text}</a> : text}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Show>

        <div
          className={classNames('sha-page-content', {
            'no-padding': noPadding,
            // 'is-designer-mode': formMode === 'designer',
          })}
        >
          {children}
        </div>
      </ShaSpin>
    </section>
  );
};
