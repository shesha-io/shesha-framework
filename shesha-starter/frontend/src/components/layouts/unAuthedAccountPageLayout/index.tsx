import React, { FC, ReactNode } from "react";
import { Row, Col } from "antd";
import { useUi } from "@shesha/reactjs";
import { UnAuthedLayoutContainer } from "./styles";

export const UnAuthedAccountPageLayout: FC<{
  className?: string;
  heading?: string;
  hint?: string;
  children?: ReactNode;
}> = ({ className, children, heading, hint }) => {
  const { accountFormCols } = useUi();

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
