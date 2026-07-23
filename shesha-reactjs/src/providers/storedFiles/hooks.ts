import { useMemo, useRef } from "react";
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

  // Store delayedUpdateClient in a ref so instance can access latest value without recreation
  const delayedUpdateClientRef = useRef(delayedUpdateClient);
  delayedUpdateClientRef.current = delayedUpdateClient;

  // Only recreate instance when isDesignerMode changes (which should trigger state reset)
  // httpClient and message are stable, delayedUpdateClient ref is passed and dereferenced inside instance
  const instance = useMemo<IAttachmentsEditorInstance>(() => {
    return new AttachmentsEditorInstance({
      httpClient,
      message,
      delayedUpdateClientRef,
      isDesignerMode,
    });
  }, [httpClient, message, isDesignerMode]);

  return instance;
};
