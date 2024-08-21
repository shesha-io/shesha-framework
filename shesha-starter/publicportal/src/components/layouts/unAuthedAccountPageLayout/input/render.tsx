import { Input, InputProps, InputRef } from "antd";
import { ChangeEvent, FC, useRef } from "react";

interface IProps extends InputProps {
  setError: (value: boolean) => void;
  type?: "text" | "password";
}

const ShaInputRender: FC<IProps> = ({
  onChange,
  required,
  setError,
  type,
  ...props
}) => {
  const ref = useRef<InputRef>();

  const setRequired = () => {
    const { value } = ref.current.input;

    if (required) {
      if (!value) {
        setError(true);
      } else {
        setError(false);
      }
    }
  };

  const onBlur = () => {
    setRequired();
  };

  const onRenderChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);

    onBlur();
  };

  const properties = { ...props, onBlur, onChange: onRenderChange };

  if (type === "password") {
    return <Input.Password ref={ref} {...properties} />;
  }

  return <Input ref={ref} {...properties} />;
};

export default ShaInputRender;
