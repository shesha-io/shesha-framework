import classNames from 'classnames';
import NodeOrFuncRenderer, { ReactNodeOrFunc } from '@/components/nodeOrFuncRenderer';
import React, {
  CSSProperties,
  FC,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
} from 'react';
import { IHtmlHeadProps } from '@/components/htmlHead';
import { Layout } from 'antd';
import { useTheme } from '@/providers';
import { withAuth } from '@/hocs';
import { useStyles } from './styles';
import { ConfigurableForm } from '../configurableForm';
import { FOOTER_CONFIGURATION, HEADER_CONFIGURATION } from '../mainLayout/constant';

const { Content, Footer } = Layout;

export interface IHorizontalLayoutProps extends IHtmlHeadProps {
  breadcrumb?: ReactNodeOrFunc;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
  layoutBackgroundStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  footer?: ReactNodeOrFunc;
  heading?: ReactNodeOrFunc;
  fixHeading?: boolean;
  showHeading?: boolean;
  noPadding?: boolean;
}

const DefaultHorizontalLayout: FC<PropsWithChildren<IHorizontalLayoutProps>> = (props) => {
  const {
    title,
    breadcrumb,
    children,
    style,
    contentStyle,
    layoutBackgroundStyle = {},
    footerStyle,
    heading,
    fixHeading = false,
    showHeading = true,
    noPadding = false,
    footer,
  } = props;

  const { theme: themeFromStorage } = useTheme();
  const { styles } = useStyles();

  useEffect(() => {
    if (!!title) document.title = title;
  }, [title]);

  const hasHeading = useMemo(() => {
    return Boolean(heading);
  }, [heading]);

  const isFixedHeading = useMemo(() => {
    return fixHeading && ((Boolean(title) && showHeading) || Boolean(heading));
  }, [heading, title, showHeading, fixHeading]);


  const headingClass = {
    'has-heading': hasHeading || (Boolean(title) && showHeading),
    'fixed-heading': isFixedHeading,
  };

  return (
    <Layout style={style} className={styles.horizontalLayout}>
      <div>
        <ConfigurableForm
          mode="readonly"
          formId={HEADER_CONFIGURATION}
          showFormInfoOverlay={false}
          showDataLoadingIndicator={false}
          showMarkupLoadingIndicator={false}
        />
      </div>


      <Content className={styles.content} style={contentStyle}>
        <NodeOrFuncRenderer>
          {breadcrumb}
          <div
            className={classNames(styles.layoutBackground, headingClass, {
              [styles.layoutBackgroundNoPadding]: noPadding,
            })}
            style={{ ...layoutBackgroundStyle, background: themeFromStorage?.layoutBackground }}
          >
            {(hasHeading || isFixedHeading) && (
              <div className={isFixedHeading ? 'fixed-heading-wrapper' : 'heading-wrapper'}>
                {heading ? (
                  <NodeOrFuncRenderer>{heading}</NodeOrFuncRenderer>
                ) : (
                  title && showHeading && <h2>{title}</h2>
                )}
              </div>
            )}
            {children}
          </div>
        </NodeOrFuncRenderer>
      </Content>

      <Footer className={styles.footer} style={footerStyle}>
        {footer ? (
          <NodeOrFuncRenderer>{footer}</NodeOrFuncRenderer>
        ) : (
          <ConfigurableForm
            mode="readonly"
            formId={FOOTER_CONFIGURATION}
            showFormInfoOverlay={false}
            showDataLoadingIndicator={false}
            showMarkupLoadingIndicator={false}
          />
        )}
      </Footer>
    </Layout>
  );
};


export const getHorizontalLayout = (page: ReactElement): JSX.Element => {
  const AuthedLayout: FC<PropsWithChildren<IHorizontalLayoutProps>> = withAuth(DefaultHorizontalLayout);
  return (
    <AuthedLayout noPadding>
      <>{page}</>
    </AuthedLayout>
  );
};

export default withAuth(DefaultHorizontalLayout);
