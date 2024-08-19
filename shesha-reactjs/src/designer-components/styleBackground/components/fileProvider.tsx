import React from "react";
import { evaluateValue, StoredFileProvider, useFormData, useGlobalState, useSheshaApplication } from "@/index";

export const FileProvider = ({ child, model, formSettings }) => {
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();
  const ownerId = evaluateValue(model?.background?.storedFile?.ownerId, { data, globalState });

  const { background } = model;

  return (
    <StoredFileProvider
      value={background?.storedFile?.id}
      fileId={background?.storedFile?.id}
      baseUrl={backendUrl}
      ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
      ownerType={
        Boolean(model?.background?.storedFile?.ownerType) ? model.background.storedFile.ownerType : Boolean(formSettings?.modelType) ? formSettings?.modelType : ''
      }
      fileCategory={model?.background?.storedFile?.fileCatergory}
      propertyName={!model.context ? model.propertyName : null
      }
    >
      {child}
    </StoredFileProvider>
  );
};