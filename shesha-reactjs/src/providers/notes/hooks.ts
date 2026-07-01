import { useEffect, useRef } from "react";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { NotesEditorInstance } from "./instance";
import { INotesEditorInstance } from "./contexts";
import { useFormOrUndefined } from "../form";

export const useNotesEditorInstance = (): INotesEditorInstance => {
  const httpClient = useHttpClient();
  const form = useFormOrUndefined();
  const isDesignerMode = form?.formMode === 'designer';

  // Use ref to maintain stable instance across renders, preserving mutable state (#notes, #notesReference)
  const instanceRef = useRef<INotesEditorInstance | null>(null);

  if (instanceRef.current === null) {
    instanceRef.current = new NotesEditorInstance({
      httpClient,
      isDesignerMode,
    });
  }

  // Update designer mode on the existing instance without recreation
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setDesignerMode(isDesignerMode);
    }
  }, [isDesignerMode]);

  return instanceRef.current;
};
