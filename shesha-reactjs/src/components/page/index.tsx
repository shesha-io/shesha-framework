import { Breadcrumb, Space } from 'antd';
import classNames from 'classnames';
import { nanoid } from 'nanoid/non-secure';
import React, { FC, useEffect } from 'react';
import { CancelButton, IndexToolbar, ShaSpin } from '..';
import { IToolbarItem } from '../../interfaces';
import Show from '../show';
import { useShaRouting, useSheshaApplication } from '../../providers';
import PageHeaderTag, { ITagProps } from './pageHeaderTag';
import StatusTag, { IStatusTagProps } from '../statusTag';
import { IToolbarButtonItem } from '../toolbar/models';
import Toolbar from '../toolbar';
import { FormIdentifier } from '../../providers/form/models';

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
  toolbarItems?: IToolbarItem[] | IToolbarButtonItem[];
  backUrl?: string;
  breadcrumbItems?: IBreadcrumbItem[];
  headerTagList?: ITagProps[];
  loading?: boolean;
  noPadding?: boolean;
  loadingText?: string;
  status?: IStatusTagProps;
}

export const Page: FC<IPageProps> = ({
  formId,
  children,
  title,
  toolbarItems,
  backUrl,
  headerTagList,
  loading,
  breadcrumbItems,
  loadingText = 'Loading...',
  noPadding = false,
  status,
}) => {
  const { router } = useShaRouting();
  const { applicationName } = useSheshaApplication();

  useEffect(() => {
    document.title = `${applicationName} | ${title}`;
  }, [applicationName, title]);

  const onBackButtonClick = () => router?.push(backUrl);

  const hasBackUrl = !!backUrl?.trim();

  const hasTagList = !!headerTagList?.length;

  const showHeading = !!title || hasBackUrl || hasTagList;

  const hasStatus = Boolean(status);

  return (
    <section className="sha-page">
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

            <Show when={hasBackUrl || hasTagList}>
              <div className="sha-page-heading-right">
                <Show when={hasTagList}>
                  {headerTagList?.map(tag => (
                    <PageHeaderTag {...tag} key={nanoid()} />
                  ))}
                </Show>

                <Show when={hasBackUrl && hasTagList}>
                  <span className="sha-page-heading-right-tag-separator">|</span>
                </Show>

                <Show when={hasBackUrl}>
                  <CancelButton onCancel={onBackButtonClick} />
                </Show>
              </div>
            </Show>
          </div>
        </Show>

        <Show when={!!toolbarItems?.length}>
          {formId ? <Toolbar items={toolbarItems as IToolbarButtonItem[]} /> : <IndexToolbar items={toolbarItems} />}
        </Show>

        <Show when={!!breadcrumbItems?.length}>
          <Breadcrumb className="sha-page-breadcrumb">
            {breadcrumbItems?.map(({ text, link }) => (
              <Breadcrumb.Item>{link ? <a href={link}>{text}</a> : text}</Breadcrumb.Item>
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

export default Page;
