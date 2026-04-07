import { DataTypes } from '@/interfaces';
import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { IObjectMetadata } from '@/interfaces/metadata';
import {
  IAttachmentsEditorActions,
  AttachmentsEditorContext,
  AttachmentsEditorEvents,
  IAttachmentsEditorInstance,
} from './contexts';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { fileListContextCode } from '@/publicJsApis';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { useAttachmentsEditorInstance } from './hooks';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { throwError } from '@/utils/errors';
import { StoredFileModel } from '../../utils/storedFile/models';
import { OnFileDownloaded, OnFileListChanged } from './models';

export interface IStoredFilesProviderProps {
  name?: string;
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  ownerName?: string;
  filesCategory?: string;

  // used for requered field validation
  value?: StoredFileModel[] | undefined;
  onChange?: OnFileListChanged | undefined;
  onDownload?: OnFileDownloaded | undefined;
}

const AttachmentsEditorProvider: FC<PropsWithChildren<IStoredFilesProviderProps>> = ({
  children,
  name,
  ownerId,
  ownerType,
  ownerName,
  filesCategory,
  // used for requered field validation
  onChange,
  onDownload,
  // value = [],
}) => {
  const instance = useAttachmentsEditorInstance();
  useEffect(() => {
    instance.init({ ownerId, ownerType, ownerName, filesCategory });
  }, [instance, ownerId, ownerType, ownerName, filesCategory]);

  instance.setOnFileListChanged(onChange);
  instance.setOnFileDownloaded(onDownload);

  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => {
      return Promise.resolve({
        typeName: 'IFileListContextApi',
        files: [{ content: fileListContextCode, fileName: 'apis/fileListContextApi.ts' }],
      });
    },
    properties: [],
    dataType: DataTypes.object,
  }), []);

  const content = (
    <AttachmentsEditorContext.Provider value={instance}>
      {children}
    </AttachmentsEditorContext.Provider>
  );

  return !isNullOrWhiteSpace(name)
    ? (
      <DataContextBinder
        id={`ctx_fl_${name}`}
        name={name}
        description={`File list context for ${name}`}
        type="control"
        data={instance}
        metadata={contextMetadata}
      >
        {content}
      </DataContextBinder>
    )
    : content;
};

const useAttachmentsEditor = (): IAttachmentsEditorInstance => {
  return useContext(AttachmentsEditorContext) ?? throwError('useAttachmentsEditor must be used within a AttachmentsEditorProvider');
};

const useAttachmentsEditorActions = (): IAttachmentsEditorActions => useAttachmentsEditor();

const useAttachmentsEditorSubscription = (eventType: AttachmentsEditorEvents): object => {
  const instance = useAttachmentsEditorActions();

  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    return instance.subscribe(eventType, () => forceUpdate({}));
  }, [instance, eventType]);

  return dummy;
};

const useAttachmentsEditorState = (): StoredFileModel[] => {
  const instance = useAttachmentsEditor();
  useAttachmentsEditorSubscription('fileList');
  return instance.fileList;
};

export { AttachmentsEditorProvider, useAttachmentsEditorActions, useAttachmentsEditorState };
