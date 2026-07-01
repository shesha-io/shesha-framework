import { useMemo } from "react";
import { AttachmentsEditorInstance } from "./instance";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { App } from "antd";
import { useDelayedUpdateOrUndefined } from "../delayedUpdateProvider";
import { IAttachmentsEditorInstance } from "./contexts";
import { useFormOrUndefined } from "../form";

export const useAttachmentsEditorInstance = (): IAttachmentsEditorInstance => {
  const httpClient = useHttpClient();
  const { message } = App.useApp();
  const delayedUpdateClient = useDelayedUpdateOrUndefined();
  const form = useFormOrUndefined();
  const isDesignerMode = form?.formMode === 'designer';

  const instance = useMemo<IAttachmentsEditorInstance>(() => {
    return new AttachmentsEditorInstance({
      httpClient,
      message,
      delayedUpdateClient,
      isDesignerMode,
    });
  }, [httpClient, message, delayedUpdateClient, isDesignerMode]);

  return instance;
};
