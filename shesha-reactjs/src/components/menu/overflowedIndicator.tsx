import { ISidebarGroup, ISidebarMenuItem } from "@/interfaces/sidebar";
import { MenuOutlined } from "@ant-design/icons";
import React, { FC, ReactNode } from "react";

interface IProps {
  className: string;
}

interface ISidebarGroupMutate extends Omit<ISidebarGroup, "title"> {
  title?: ReactNode | string | any;
}

export const getMutatedMenuItem = (
  item: ISidebarGroupMutate,
): ISidebarMenuItem => ({
  ...item,
  title: item.title,
});

export const OverflowedIndicator: FC<IProps> = ({ className }) => (
  <span className={className}>
    <MenuOutlined /> Menu
  </span>
);

export default OverflowedIndicator;
