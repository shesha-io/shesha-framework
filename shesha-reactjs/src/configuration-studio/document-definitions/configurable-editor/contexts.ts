import { createNamedContext } from "@/utils/react";

export type ProcessingState = 'idle' | 'processing' | 'done' | 'failed';

export interface IDocumentEditorState {
  loadingState: ProcessingState;
  loadingError?: unknown;
  savingState: ProcessingState;
  savingError?: unknown;

  isReadOnly: boolean;
  isModified: boolean;
};

export interface IDocumentEditorActions {
  saveAsync: () => Promise<void>;
};

export const DocumentEditorStateContext = createNamedContext<IDocumentEditorState>(undefined, "DocumentEditorStateContext");
export const DocumentEditorActionsContext = createNamedContext<IDocumentEditorActions>(undefined, "DocumentEditorActionsContext");
