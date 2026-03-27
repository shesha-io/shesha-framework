import { useState } from "react";
import { AttachmentsEditorInstance } from "./instance";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { App } from "antd";
import { useDelayedUpdateOrUndefined } from "../delayedUpdateProvider";
import { IAttachmentsEditorInstance } from "./contexts";

export const useAttachmentsEditorInstance = (): IAttachmentsEditorInstance => {
  const httpClient = useHttpClient();
  const { message } = App.useApp();
  const delayedUpdateClient = useDelayedUpdateOrUndefined();

  const [instance] = useState<IAttachmentsEditorInstance>(() => {
    return new AttachmentsEditorInstance({
      httpClient,
      message,
      delayedUpdateClient,
    });
  });

  return instance;
};
