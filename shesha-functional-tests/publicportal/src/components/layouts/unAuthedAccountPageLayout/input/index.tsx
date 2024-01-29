import { FC } from "react";
import { ShaInputStyledWrapper } from "./styles";
import ShaInputWrapper from "./wrapper";

interface IProps {
  label?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "password"  | "current-password";
}

const ShaInput: FC<IProps> = ({ name, ...props }) => {
  return (
    <ShaInputStyledWrapper name={name}>
      <ShaInputWrapper {...props} />
    </ShaInputStyledWrapper>
  );
};

export default ShaInput;
