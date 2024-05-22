import React, { PropsWithChildren } from "react";
import { FC } from "react";
import { useExecuteScriptAction } from './execute-script';
import { useApiCallAction } from './api-call';
import { useConfigurationItemsExportAction } from './configuration-items-export';
import { useConfigurationItemsImportAction } from './configuration-items-import';
import { useShowMessageAction } from "./show-message";

export const ApplicationActionsProcessor: FC<PropsWithChildren<{}>> = ({ children }) => {
  useExecuteScriptAction();
  useApiCallAction();
  useShowMessageAction();
  useConfigurationItemsExportAction();
  useConfigurationItemsImportAction();

  return (
    <>{children}</>
  );
};