import { PropsWithChildren, FC } from "react";
import { useExecuteScriptAction } from './execute-script';
import { useExecuteSignIn } from "./execute-sign-in";
import { useApiCallAction } from './api-call';
import { useConfigurationItemsExportAction } from './configuration-items-export';
import { useConfigurationItemsImportAction } from './configuration-items-import';
import { useShowMessageAction } from "./show-message";
import { useBlockingLoaderActions } from "@/providers/blockingLoader";
import { SheshaActionOwners } from "@/providers/configurableActionsDispatcher/models";

export const ApplicationActionsProcessor: FC<PropsWithChildren> = ({ children }) => {
  useExecuteScriptAction();
  useExecuteSignIn();
  useApiCallAction();
  useShowMessageAction();
  useConfigurationItemsExportAction();
  useConfigurationItemsImportAction();
  useBlockingLoaderActions('page', 'Common', SheshaActionOwners.Common);

  return (
    <>{children}</>
  );
};
