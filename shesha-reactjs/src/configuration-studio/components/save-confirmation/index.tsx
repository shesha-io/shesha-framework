import { IModalApi } from '@/configuration-studio/cs/modalApi';
import { IDocumentInstance, SaveDocumentResponse } from '@/configuration-studio/models';
import { Button, Typography } from 'antd';
import React, { FC } from 'react';

type SaveConfirmationBodyProps = {
  doc: IDocumentInstance;
};

const SaveConfirmationBody: FC<SaveConfirmationBodyProps> = ({ doc }) => {
  return (
    <div>
      <Typography.Paragraph>
        Do you want to save the changes you made to `{doc.label}`?
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text type="secondary">Your changes will be lost if you don`t save them.</Typography.Text>
      </Typography.Paragraph>
    </div>
  );
};


type SaveConfirmationFooterProps = {
  doc: IDocumentInstance;
  onResponse: (response: SaveDocumentResponse) => void;
};

const SaveConfirmationFooter: FC<SaveConfirmationFooterProps> = ({ onResponse, doc }) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const onSaveClick = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await doc.saveAsync();
      setIsSaving(false);
      onResponse('save');
    } catch (error) {
      console.error('Failed to save document', error);
      setIsSaving(false);
    }
  };
  return (
    <>
      <Button type="primary" onClick={onSaveClick} loading={isSaving}>Save</Button>
      <Button type="default" onClick={() => onResponse('dont-save')} disabled={isSaving}>Don`t Save</Button>
      <Button type="default" onClick={() => onResponse('cancel')} disabled={isSaving}>Cancel</Button>
    </>
  );
};

export const confirmSaveDocumentAsync = async (doc: IDocumentInstance, modalApi: IModalApi): Promise<SaveDocumentResponse | undefined> => {
  return await modalApi.showModalContentAsync<SaveDocumentResponse>(({ resolve, removeModal }) => {
    const onResponse = (response: SaveDocumentResponse): void => {
      resolve(response);
      removeModal();
    };

    return {
      title: 'Save changes',
      content: <SaveConfirmationBody doc={doc} />,
      footer: <SaveConfirmationFooter doc={doc} onResponse={onResponse} />,
    };
  }, { width: '416x', showCloseIcon: false });
};
