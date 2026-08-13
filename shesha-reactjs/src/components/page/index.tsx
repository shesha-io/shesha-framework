import { Breadcrumb, Button, Result, Space } from 'antd';
import classNames from 'classnames';
import { FC, PropsWithChildren, useEffect } from 'react';
import { ShaSpin } from '..';
import Show from '@/components/show';
import { useShaRouting, useSheshaApplication, useTheme } from '@/providers';
import StatusTag, { IStatusTagProps } from '@/components/statusTag';
import { FormIdentifier } from '@/providers/form/models';
import { ItemType } from 'antd/lib/breadcrumb/Breadcrumb';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';

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
  requiredPermissions?: string[];
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
  requiredPermissions,
}) => {
  const { applicationName, anyOfPermissionsGranted } = useSheshaApplication();
  const { router } = useShaRouting();
  const { theme } = useTheme();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = !isNullOrWhiteSpace(applicationName) ? `${applicationName} | ${title}` : title ?? "";
    return () => {
      document.title = prevTitle;
    };
  }, [applicationName, title]);

  const hasBackUrl = !!backUrl?.trim();

  const showHeading = !!title || hasBackUrl;

  const hasStatus = Boolean(status);

  const hasAllowedPermission = anyOfPermissionsGranted(requiredPermissions ?? []);

  if (!hasAllowedPermission) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You are not authorised to access this page"
        extra={(
          <Button onClick={() => router.push('/')} type="primary">
            Back Home
          </Button>
        )}
      />
    );
  }

  return (
    <section className="sha-page" style={{ background: theme.layoutBackground }}>
      <ShaSpin spinning={loading || false} tip={loadingText}>
        <Show when={showHeading}>
          <div className="sha-page-heading">
            <div className="sha-page-heading-left">
              <Show when={!!title?.trim() || hasStatus}>
                <h1 className="sha-page-title">
                  <Space>
                    {title}

                    <StatusTag
                      color={status?.color ?? ""}
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

        {isNonEmptyArray(breadcrumbItems) && (
          <Breadcrumb
            className="sha-page-breadcrumb"
            items={breadcrumbItems.map<ItemType>(({ text, link }) => ({ title: text, href: link ?? "" }))}
          />
        )}

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
