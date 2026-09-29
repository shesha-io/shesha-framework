import { FieldValidationError, ValidationNodeRef } from "@/interfaces";
import { isNullOrWhiteSpace } from "@/utils";
import { ISheshaErrorTypes } from "@/utils/errors";

export type Severity = ISheshaErrorTypes;

export interface NodeRef {
  kind: 'form' | 'component';
  /** index among siblings; ignored for the form node */
  index?: number;
  /** stable component id, if any */
  id?: string;
  /** human readable label, e.g. "Email field" */
  label?: string;
}

export interface Issue {
  severity: Severity;
  code?: string;
  message: string;
  /** Address of the settings owner. Must be non-empty. */
  path: NodeRef[];
  /** Dotted path inside the owner's settings, e.g. "validation.pattern" */
  property?: string;
}

export const SEVERITY_META: Record<Severity, { color: string; label: string }> = {
  error: { color: 'error', label: 'Error' },
  warning: { color: 'warning', label: 'Warn' },
  info: { color: 'info', label: 'Info' },
};

/** `components[0]#contact-form.children[1]#email.settings.name` */
export function formatPath(path: ValidationNodeRef[], property?: string): string {
  const pathParts = path.map((ref) => typeof (ref.label) === "string" && !isNullOrWhiteSpace(ref.label)
    ? ref.label
    : !isNullOrWhiteSpace(ref.id)
      ? `#${ref.id}`
      : `[${ref.index ?? 0}]`);

  return pathParts.join('/') + (!isNullOrWhiteSpace(property) ? `.${property}` : '');
}

export const issueKey = (i: FieldValidationError): string => `${formatPath(i.path, i.propertyName)}|${i.code}`;

/** Errors first, then document order, then code. Deterministic for CI diffs. */
export function compareIssues(a: FieldValidationError, b: FieldValidationError): number {
  if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
  const pa = formatPath(a.path, a.propertyName);
  const pb = formatPath(b.path, b.propertyName);
  return pa.localeCompare(pb) || (a.code ?? "").localeCompare(b.code ?? "");
}
