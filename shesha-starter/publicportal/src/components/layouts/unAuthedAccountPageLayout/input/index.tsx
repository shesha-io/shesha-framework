import { FC } from "react";
import { ShaInputStyledWrapper } from "./styles";
import ShaInputWrapper from "./wrapper";

interface IProps {
  className?: string;
  label?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "password";
  disabled?: boolean;
}

const ShaInput: FC<IProps> = ({ className, name, ...props }) => {
  return (
    <ShaInputStyledWrapper name={name} className={className}>
      <ShaInputWrapper {...props} />
    </ShaInputStyledWrapper>
  );
};

export default ShaInput;
