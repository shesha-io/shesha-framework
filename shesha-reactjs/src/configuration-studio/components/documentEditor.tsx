import React, { FC } from 'react';
import { CustomErrorBoundary } from '@/components';
import { IDocumentInstance, isCIDocument, isCustomDocument } from '../models';
import { useStyles } from '../styles';
import { DocumentInstanceProvider } from '../document-instance/provider';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DocumentToolbar } from './documentToolbar';
import { RevisionHistoryDrawer } from './revision-history/drawer';
import { isDefined } from '@/utils/nullables';

export interface IItemEditorProps {
  doc: IDocumentInstance;
}

export const DocumentEditor: FC<IItemEditorProps> = ({ doc }) => {
  const { styles } = useStyles();

  if (!isCIDocument(doc) && !isCustomDocument(doc))
    return undefined;

  const { definition } = doc;
  const { Editor, Provider } = definition;

  return (
    <div className={styles.csDocEditor}>
      <DocumentInstanceProvider documentInstance={doc}>
        <CustomErrorBoundary>
          <ConditionalWrap
            condition={Boolean(Provider)}
            wrap={(content) =>
              isDefined(Provider)
                ? (
                  <Provider doc={doc}>
                    {content}
                  </Provider>
                )
                : undefined}
          >
            <DocumentToolbar doc={doc} />
            <Editor doc={doc} />
            <RevisionHistoryDrawer />
          </ConditionalWrap>
        </CustomErrorBoundary>
      </DocumentInstanceProvider>
    </div>
  );
};
