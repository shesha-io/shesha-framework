import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { FC } from "react";
import { ShaUserIconStyledWrapper } from "./styles";

interface IProps {
  username: string;
}

const ShaUserIcon: FC<IProps> = ({ username }) => {
  return (
    <ShaUserIconStyledWrapper arrow overlay={<Menu>Hello</Menu>}>
      <div className="sha-user">
        <span className="sha-user-name"> Hi {username}!</span>

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
