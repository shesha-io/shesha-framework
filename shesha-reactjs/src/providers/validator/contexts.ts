import { createContext } from "react";
import { IValidationCollector } from "./interfaces";

export const ValidationCollectorContext = createContext<IValidationCollector | undefined>(undefined);
