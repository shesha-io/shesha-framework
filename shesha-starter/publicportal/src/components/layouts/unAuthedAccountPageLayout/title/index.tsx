import React, { FC } from "react";
import { ShaTitleStyledWrapper } from "./styles";

interface IProps {
  title: string;
}

const ShaHeader: FC<IProps> = ({ title }) => {
  return (
    <ShaTitleStyledWrapper>
      <h1 className="sha-title">{title}</h1>
    </ShaTitleStyledWrapper>
  );
};

export default ShaHeader;
