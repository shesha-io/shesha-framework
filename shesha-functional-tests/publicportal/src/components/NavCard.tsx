import React from "react";
import { Card } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

interface IProps {
  title: string;
  url: string;
  description: string;
}

export const NavCard: React.FC<IProps> = ({ title, url, description }) => (
  <Card style={{ width: 400 }}>
    <ArrowRightOutlined style={{ paddingBottom: "5px" }} />
    <a href={url} target="_blank">
      <h4 style={{ fontSize: "20px", color: "#1434A4" }}>{title}</h4>
    </a>
    <p style={{ fontSize: "15px" }}>{description}</p>
  </Card>
);

export default NavCard;
