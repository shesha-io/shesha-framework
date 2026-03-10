import { RequiredMark } from "antd/lib/form/Form";
import React, { ReactNode } from "react";

/**
 * Default Shesha Required Mark
 * @param label
 * @param param1
 * @returns
 */
export const defaultRequiredMark: RequiredMark = (label: ReactNode, { required }: { required: boolean }) => (
  <>
    {label}
    {required && <span className="sha-required-mark">*</span>}
  </>
);
