import { FormProps } from "antd";
import { RequiredMark } from "antd/lib/form/Form";
import React, { ReactNode } from "react";

const defaultRequiredMark: RequiredMark = (label: ReactNode, { required }: { required: boolean }) => (
    <>
        {label}
        {required && <span className="sha-required-mark">*</span>}
    </>
);

export const defaultFormProps: Partial<FormProps> = {
    requiredMark: defaultRequiredMark,
};