import { HttpClientApi } from "@/publicJsApis/httpClient";
import { CreateNoteArgs, DeleteNoteArgs, NoteModel, NotesReference, UpdateNoteArgs } from "./models";
import { isOwnerReferenceValid } from "@/utils/entity";
import { buildUrl } from "@/utils";
import { CreateNoteDto, GetNotesListPayload, NoteDto, NOTES_URLS } from "./api-models";
import { getEntityTypeIdentifierQueryParams } from "../metadataDispatcher/entities/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { extractAjaxResponse, IAjaxResponse } from "@/interfaces";
import { noteDto2NoteModel, notesReferenceEqual } from "./utils";
import { INotesEditorActions, INotesEditorState } from "./contexts";

export type NotesEditorInstanceArgs = {
  httpClient: HttpClientApi;
};

export class NotesEditorInstance implements INotesEditorActions, INotesEditorState {
  #notes: NoteModel[] = [];

  #httpClient: HttpClientApi;

  #notesReference: NotesReference | undefined;

  constructor(args: NotesEditorInstanceArgs) {
    this.#httpClient = args.httpClient;
  }

  init = (notesReference: NotesReference): void => {
    if (isDefined(this.#notesReference) && notesReferenceEqual(this.#notesReference, notesReference))
      return;

    this.#notesReference = notesReference;
    if (isOwnerReferenceValid(this.#notesReference))
      this.fetchNotesAsync()
        .catch((error) => {
          console.error('Failed to fetch notes', error);
        });
  };

  private fetchNotesAsync = async (): Promise<void> => {
    const reference = this.getValidNoteReference();

    const url = buildUrl<GetNotesListPayload>(NOTES_URLS.GET_LIST, {
      ownerId: reference.ownerId,
      ownerType: getEntityTypeIdentifierQueryParams(reference.ownerType),
      category: reference.category,
      allCategories: isNullOrWhiteSpace(reference.category),
    });
    try {
      const response = await this.#httpClient.get<IAjaxResponse<NoteDto[]>>(url);
      const noteDtos = extractAjaxResponse(response.data);
      const noteModels = noteDtos.map(noteDto2NoteModel);
      this.updateNotes(() => noteModels);
    } catch (error) {
      console.error(error);
      // TODO: handle errors
    }
  };

  private getValidNoteReference(): NotesReference {
    if (!this.#notesReference || !isOwnerReferenceValid(this.#notesReference))
      throw new Error('Notes reference is not valid.');
    return this.#notesReference;
  }

  createNoteAsync = async (args: CreateNoteArgs): Promise<void> => {
    const reference = this.getValidNoteReference();
    const payload: CreateNoteDto = {
      ownerId: reference.ownerId,
      ownerType: reference.ownerType,
      category: reference.category,
      priority: args.priority,
      parentId: args.parentId,
      noteText: args.noteText,
    };
    const response = await this.#httpClient.post<IAjaxResponse<NoteDto>>(NOTES_URLS.NOTE_CREATE, payload);
    const noteDto = extractAjaxResponse(response.data);
    const noteModel = noteDto2NoteModel(noteDto);
    this.updateNotes((notes) => [...notes, noteModel]);
  };

  updateNoteAsync = async (args: UpdateNoteArgs): Promise<void> => {
    const note = this.#notes.find((n) => n.id === args.id);
    if (!note)
      throw new Error('Note not found.');

    const payload = { ...note, noteText: args.noteText };
    try {
      const response = await this.#httpClient.put<IAjaxResponse<NoteDto>>(NOTES_URLS.NOTE_UPDATE, payload);
      const updatedNote = extractAjaxResponse(response.data);
      const updatedNoteModel = noteDto2NoteModel(updatedNote);
      this.updateNotes((notes) => notes.map((n) => n.id === note.id ? updatedNoteModel : n));
    } catch (error) {
      console.error(error);
      // TODO: handle errors
    }
  };

  deleteNoteAsync = async (args: DeleteNoteArgs): Promise<void> => {
    const url = buildUrl(NOTES_URLS.NOTE_DELETE, { id: args.id });
    const response = await this.#httpClient.delete<IAjaxResponse<void>>(url);
    try {
      extractAjaxResponse(response.data);
      this.updateNotes((notes) => notes.filter((n) => n.id !== args.id));
    } catch (error) {
      console.error(error);
      // TODO: handle errors
    }
  };

  private updateNotes = (updater: (files: NoteModel[]) => NoteModel[]): void => {
    this.#notes = updater(this.#notes);
    // TODO: notify subscribers
    // this.notifySubscribers(['notes']);
  };

  get notes(): NoteDto[] {
    return this.#notes;
  }
}
