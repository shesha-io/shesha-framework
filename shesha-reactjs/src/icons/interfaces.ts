import { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

export type IconProps = {
  fill?: string | undefined;
  style?: React.CSSProperties | undefined;
};

export type CustomIconProps = Partial<Omit<CustomIconComponentProps, "fill" | "style">> & IconProps;
