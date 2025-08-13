import { createNamedContext } from "@/utils/react";
import { IDocumentInstance } from "../models";

export const DocumentInstanceContext = createNamedContext<IDocumentInstance>(undefined, "DocumentInstanceContext");