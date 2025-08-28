import { ISidebarGroup, ISidebarMenuItem } from "@/interfaces/sidebar";
import { CaretDownOutlined, MenuOutlined } from "@ant-design/icons";
import React, { FC, Fragment, ReactNode } from "react";

interface IProps {
  className: string;
}

interface ISidebarGroupMutate extends Omit<ISidebarGroup, "title"> {
  title?: ReactNode | string | any;
}

export const getMutatedMenuItem = (
  item: ISidebarGroupMutate
): ISidebarMenuItem => ({
  ...item,
  title: item?.childItems?.length ? (
    <Fragment>
      <span>{item.title}</span>
      <CaretDownOutlined style={{ marginLeft: "8px" }} />
    </Fragment>
  ) : (
    item.title
  ),
});

export const OverflowedIndicator: FC<IProps> = ({ className }) => (
  <span className={className}>
    <MenuOutlined /> Menu
  </span>
);

export default OverflowedIndicator;
