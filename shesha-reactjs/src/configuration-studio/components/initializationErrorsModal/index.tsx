import { useCache } from "@/hooks/useCache";
import { useAuth } from "@/providers";
import useModal from "antd/lib/modal/useModal";
import React, { FC } from "react";
import { useEffectOnce } from "react-use";

export const InitializationErrorsModal: FC = () => {
  const { errorsInfo } = useAuth();
  const [modal, modalContext] = useModal();
  const storage = useCache('initialization_errors');

  useEffectOnce(() => {
    storage.getItem('last_initialization')
      .then((lastInitialization) => {
        if (lastInitialization === errorsInfo?.lastInitialization) return;
        setTimeout(() => {
          if (errorsInfo?.errors?.length) {
            storage.setItem('last_initialization', errorsInfo.lastInitialization);
            modal.error({
              title: 'Application initalized with critical errors: ',
              content: <>{errorsInfo.errors.map((e, i) => <p key={i}>• {e}</p>)}</>,
            });
          }
        }, 1000);
      });
  });

  return modalContext;
};
