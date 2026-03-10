import React, { FC, ReactNode } from 'react';
import { Col, Row } from 'antd';
import { UnAuthedLayoutContainer } from './styles';

const accountFormCols = {
  xs: { span: 14, offset: 5 },
  sm: { span: 12, offset: 6 },
  md: { span: 10, offset: 7 },
  lg: { span: 8, offset: 8 },
  xl: { span: 6, offset: 9 },
  xxl: { span: 4.5, offset: 10.5 },
};

export const UnAuthedAccountPageLayout: FC<{
  className?: string;
  heading?: string;
  hint?: string;
  children?: ReactNode;
}> = ({ className, children, heading, hint }) => {
  return (
    <UnAuthedLayoutContainer className={className}>
      <div className="un-authed-account-page-layout-form-container">
        <Row>
          <Col {...accountFormCols}>
            <div className="un-authed-account-page-layout-form">
              <div className="un-authed-account-page-layout-logo">
                <img src="/images/app-logo.png" />
              </div>
            </div>
            {heading && (
              <h2 className="un-authed-account-page-layout-heading">
                {heading}
              </h2>
            )}

            {hint && (
              <p className="un-authed-account-page-layout-hint">{hint}</p>
            )}

            {children}
          </Col>
        </Row>
      </div>
    </UnAuthedLayoutContainer>
  );
};

export default UnAuthedAccountPageLayout;
