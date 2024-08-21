import { DownOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { FC } from "react";
import { ShaUserIconStyledWrapper } from "./styles";
import { useAuth } from '@shesha-io/reactjs';

interface IProps {
}

const ShaUserIcon: FC<IProps> = () => {
  const { loginInfo, logoutUser } = useAuth();

  return (
    <ShaUserIconStyledWrapper arrow menu={{
      items: [{
        key: 'logout',
        onClick: logoutUser,
        label: (<>{<LoginOutlined />} Logout</>)
      }]
    }}>
      <div className="sha-user">
        <span className="sha-user-name"> Hi {loginInfo?.fullName}!</span>

        <span className="sha-arrow-down">
          <DownOutlined />
        </span>

        <span className="sha-user-icon">
          <UserOutlined />
        </span>
      </div>
    </ShaUserIconStyledWrapper>
  );
};

export default ShaUserIcon;
