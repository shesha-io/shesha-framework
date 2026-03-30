import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  IFileUpload,
  FileUploadContext,
} from './contexts';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { FileUploadMode, FileUploadValue } from './models';
import { throwError } from '@/utils/errors';
import { useFileUploadInstance } from './hooks';
import { StoredFileModel } from '../../utils/storedFile/models';
import { FileUploadEvents } from './instance';

export interface IFileUploadProviderProps {
  ownerId?: string;
  ownerType?: string | IEntityTypeIdentifier;
  propertyName?: string;
  uploadMode?: FileUploadMode;
  value?: FileUploadValue;
  onChange?: (value: FileUploadValue) => void;
}

const FileUploadProvider: FC<PropsWithChildren<IFileUploadProviderProps>> = (props) => {
  const {
    ownerId,
    ownerType,
    propertyName,
    children,
    uploadMode = 'async',
    onChange,
    // value,
  } = props;

  const instance = useFileUploadInstance();
  instance.setOnChange(onChange);
  useEffect(() => {
    instance.init({ ownerId, ownerType, propertyName, uploadMode });
  }, [instance, ownerId, ownerType, propertyName, uploadMode]);

  return (
    <FileUploadContext.Provider value={instance}>
      {children}
    </FileUploadContext.Provider>
  );
};

const useFileUploadOrUndefined = (): IFileUpload | undefined => useContext(FileUploadContext);

const useFileUpload = (): IFileUpload => {
  return useFileUploadOrUndefined() ?? throwError('useStoredFileActions must be used within a StoredFileProvider');
};

export const useFileUploadSubscription = (eventType: FileUploadEvents): object => {
  const fileUpload = useFileUpload();

  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    return fileUpload.subscribe(eventType, () => forceUpdate({}));
  }, [fileUpload, eventType]);

  return dummy;
};

const useFileUploadState = (): StoredFileModel | undefined => {
  const fileUpload = useFileUpload();
  useFileUploadSubscription('file');
  return fileUpload.fileInfo;
};

export { FileUploadProvider, useFileUpload, useFileUploadOrUndefined, useFileUploadState };
