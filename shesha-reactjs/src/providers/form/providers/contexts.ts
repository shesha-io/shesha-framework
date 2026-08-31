import { createNamedContext } from "@/utils/react";
import { IShaFormInstance } from "../store/interfaces";
import { IFormValidationErrors } from "@/interfaces";

export const ShaFormErrorsUpdateContext = createNamedContext<IFormValidationErrors | undefined>(undefined, "ShaFormErrorsUpdateContext");

export const ShaFormDataUpdateContext = createNamedContext<object | undefined>(undefined, "ShaFormDataUpdateContext");

export const ShaFormInstanceContext = createNamedContext<IShaFormInstance | undefined>(undefined, "ShaFormInstanceContext");

