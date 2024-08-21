import { createNamedContext } from "@/utils/react";
import { IShaFormInstance } from "../store/interfaces";

export interface IShaFormStateContext {
    shaForm: IShaFormInstance;
}

export const ShaFormStateContext = createNamedContext<IShaFormStateContext>(undefined, "FormStateContext");

export const ShaFormInstanceContext = createNamedContext<IShaFormInstance>(undefined, "ShaFormInstanceContext");

