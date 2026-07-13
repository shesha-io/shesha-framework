import { useState } from "react";
import { useHttpClient } from "../sheshaApplication/publicApi";
import { NotesEditorInstance } from "./instance";
import { INotesEditorInstance } from "./contexts";

export const useNotesEditorInstance = (): INotesEditorInstance => {
  const httpClient = useHttpClient();

  const [instance] = useState<INotesEditorInstance>(() => {
    return new NotesEditorInstance({
      httpClient,
    });
  });

  return instance;
};
