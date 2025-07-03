// Utility functions for view generation logic

import { evaluateString } from "@/providers/form/utils";

export function findContainersWithPlaceholder(markup: any, placeholder: string): any[] {
  const containers: any[] = [];
  findContainersWithPlaceholderRecursive(markup, placeholder, containers);
  return containers;
}

export function findContainersWithPlaceholderRecursive(token: any, className: string, results: any[]): void {
  if (!token) return;
  if (typeof token === 'object' && token !== null) {
    if (token.componentName === className || token.propertyName === className) {
      results.push(token);
    }
    if (Array.isArray(token)) {
      token.forEach(item => findContainersWithPlaceholderRecursive(item, className, results));
    } else {
      for (const key in token) {
        findContainersWithPlaceholderRecursive(token[key], className, results);
      }
    }
  }
}

export async function safeStringify(obj: any, space?: number) {
  const seen = new WeakSet();
  return JSON.stringify(obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  }, space);
}

export function deserializeExtensionJson<T>(data: object): T {
  try {
    return data as T;
  } catch (error) {
    console.error("Unable to deserialize extension JSON:", error);
    throw new Error(`Unable to deserialize extension JSON: ${data}`);
  }
}

export function humanizeModelType(modelType: string): string {
  if (!modelType) return '';
  const parts = modelType.split('.');
  const name = parts[parts.length - 1];
  return name.replace(/([A-Z])/g, ' $1').trim();
}

export function processBaseMarkup(markup: string, replacements: Record<string, any>): string {
    return evaluateString(markup, replacements, true);
}