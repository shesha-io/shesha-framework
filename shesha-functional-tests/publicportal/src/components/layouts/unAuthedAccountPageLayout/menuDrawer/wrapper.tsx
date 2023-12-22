import Link from "next/link";
import { FC, PropsWithChildren } from "react";

interface IProps extends PropsWithChildren {
  target?: string;
}

const ShaMenuDrawerWrapper: FC<IProps> = ({ children, target }) => {
  if (target) {
    return (
      <Link href={target} className="menu-item">
        {children}
      </Link>
    );
  }

  return <div className="menu-item">{children}</div>;
};

export default ShaMenuDrawerWrapper;
