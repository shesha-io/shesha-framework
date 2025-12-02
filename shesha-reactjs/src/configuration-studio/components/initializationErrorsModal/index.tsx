import { useCache } from "@/hooks/useCache";
import { useAuth } from "@/providers";
import useModal from "antd/lib/modal/useModal";
import React, { FC, useEffect } from "react";

export const InitializationErrorsModal: FC = () => {
  const { errorsInfo } = useAuth();
  const [modal, modalContext] = useModal();
  const storage = useCache('initialization_errors');

  useEffect(() => {
    storage.getItem('last_initialization')
      .then((lastInitialization) => {
        if (lastInitialization !== errorsInfo?.lastInitialization && errorsInfo?.errors?.length) {
          storage.setItem('last_initialization', errorsInfo.lastInitialization);
          modal.error({
            title: 'Application initialized with critical errors: ',
            content: <>{errorsInfo.errors.map((e, i) => <p key={i}>• {e}</p>)}</>,
          });
        }
      });
  }, [errorsInfo, modal, storage]);

  return modalContext;
};
