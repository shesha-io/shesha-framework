import Link from "next/link";
import { FC, PropsWithChildren } from "react";

interface IProps extends PropsWithChildren {
  target?: string;
}

const ShaMenuDrawerWrapper: FC<IProps> = ({ children, target }) => {
  if (target) {
    return (
      <Link href={target}>
        <a className="menu-item">{children}</a>
      </Link>
    );
  }

  return <div className="menu-item">{children}</div>;
};

export default ShaMenuDrawerWrapper;
