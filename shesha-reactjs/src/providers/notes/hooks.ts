import { useState } from "react";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { NotesEditorInstance } from "./instance";
import { INotesEditorInstance } from "./contexts";
import { useFormOrUndefined } from "../form";

export const useNotesEditorInstance = (): INotesEditorInstance => {
  const httpClient = useHttpClient();
  const form = useFormOrUndefined();
  const isDesignerMode = form?.formMode === 'designer';

  const [instance] = useState<INotesEditorInstance>(() => {
    return new NotesEditorInstance({
      httpClient,
      isDesignerMode,
    });
  });

  return instance;
};
