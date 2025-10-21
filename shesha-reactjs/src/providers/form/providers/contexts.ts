import { createNamedContext } from "@/utils/react";
import { IShaFormInstance } from "../store/interfaces";

export const ShaFormDataUpdateContext = createNamedContext<object | undefined>(undefined, "ShaFormDataUpdateContext");

export const ShaFormInstanceContext = createNamedContext<IShaFormInstance | undefined>(undefined, "ShaFormInstanceContext");

