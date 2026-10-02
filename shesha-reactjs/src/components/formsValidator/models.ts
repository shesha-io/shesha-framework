import { ConfigurationIssue } from "@/providers/formDesigner/models";

export const ITEM_STATUSES = [
  'pending',
  'processing',
  'done',
  'error',
] as const;
export type ItemStatus = typeof ITEM_STATUSES[number];

export type FormItem = {
  id: string;
  module: string;
  name: string;
//   lastValidationTime?: string;
//   isModified?: string;
};

export type FormProcessingItem = FormItem & {
  status: ItemStatus;
  // result?: string | undefined;
  errorMessage?: string | undefined;
  result?: ValidationResult | undefined;
};

export type ValidationResult = {
  issues: ConfigurationIssue[];
};

export type FormDependencyType = 'entity' | 'ref-list' | 'form' | 'form-component';

export type FormDependency = {
  type: FormDependencyType;
  module: string | null;
  name: string;
  isSatisfied: boolean;
  hasIssues?: boolean;
};

export type UpdateFormDependenciesInput = {
  id: string;
  dependencies: FormDependency[];
};
