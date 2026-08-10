import { Form } from "antd";
import { ComponentProps } from "react";
import { FirstArgument } from "./utilityTypes";

type FormProps<T> = ComponentProps<typeof Form<T>>;
export type OnFormFinishFailed<T> = FormProps<T>['onFinishFailed'];
export type ValidateErrorEntity<T = unknown> = FirstArgument<OnFormFinishFailed<T>>;
export type FinishFailedHandler<Values extends object = object> = (errorInfo: ValidateErrorEntity<Values>) => void;
