import { IConfigurableTheme } from "@shesha-io/reactjs";
import { Col, Image, Row } from "antd";
import { FC, ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import { screenSize } from "@/styles/variables";
import { LoginLayoutContainer } from "./styles";

interface IProps {
  className?: string;
  colorTheme?: IConfigurableTheme;
  imgSrc: string;
  imgWidth: number;
  children?: ReactNode;
}

export const LoginPageLayout: FC<IProps> = ({
  className,
  children,
  imgSrc,
  imgWidth,
}) => {
  const isTabletScreen = useMediaQuery({
    query: `(max-width: ${screenSize.tablet})`,
  });

  const span = isTabletScreen ? 24 : 12;

  return (
    <LoginLayoutContainer className={className}>
      <Row className="sha-login-layout">
        {!isTabletScreen && (
          <Col className="sha-login-layout-logo" span={span}>
            <Image
              className="sha-login-layout-logo-icon"
              src={imgSrc}
              width={imgWidth}
              preview={false}
            />
          </Col>
        )}
        <Col className="sha-login-layout-sign-in" span={span}>
          {children}
        </Col>
      </Row>
    </LoginLayoutContainer>
  );
};

export default LoginPageLayout;
