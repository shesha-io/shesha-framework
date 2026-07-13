import { useState } from "react";
import { FileUploadInstance } from "./instance";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { App } from "antd";
import { useDelayedUpdateOrUndefined } from "../delayedUpdateProvider";
import { IFileUpload } from "./contexts";

export const useFileUploadInstance = (): IFileUpload => {
  const httpClient = useHttpClient();
  const { message } = App.useApp();
  const delayedUpdateClient = useDelayedUpdateOrUndefined();

  const [instance] = useState(() => {
    return new FileUploadInstance({
      httpClient,
      message,
      delayedUpdateClient,
    });
  });

  return instance;
};
