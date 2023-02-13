import React from "react";
import { FC } from "react";
import { useExecuteScriptAction } from './execute-script';
import { useApiCallAction } from './api-call';
import { useConfigurationItemsExportAction } from './configuration-items-export';
import { useConfigurationItemsImportAction } from './configuration-items-import';

export const ApplicationActionsProcessor: FC = ({ children }) => {
  useExecuteScriptAction();
  useApiCallAction();
  useConfigurationItemsExportAction();
  useConfigurationItemsImportAction();

  return (
    <>{children}</>
  );
}