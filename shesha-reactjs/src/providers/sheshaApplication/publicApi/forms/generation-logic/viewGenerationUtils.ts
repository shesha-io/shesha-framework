// Utility functions for view generation logic

import { evaluateString } from "@/providers/form/utils";

export function findContainersWithPlaceholder(markup: any, placeholder: string): any[] {
  const containers: any[] = [];
  const visited = new WeakSet();
  findContainersWithPlaceholderRecursive(markup, placeholder, containers, visited);
  return containers;
}
export function findContainersWithPlaceholderRecursive(
  token: any,
  placeholder: string,
  results: any[],
  visited: WeakSet<any>
): void {
  if (!token) return;
  if (typeof token === 'object' && token !== null) {
    if (visited.has(token)) return;
    visited.add(token);
    if (token.componentName === placeholder || token.propertyName === placeholder) {
      results.push(token);
    }
    if (Array.isArray(token)) {
      token.forEach(item =>
        findContainersWithPlaceholderRecursive(item, placeholder, results, visited)
      );
    } else {
      for (const key in token) {
        findContainersWithPlaceholderRecursive(token[key], placeholder, results, visited);
      }
    }
  }
}

export function castToExtensionType<T>(data: unknown): T {
    if (!data || typeof data !== 'object') {
        throw new Error(`Invalid extension data: expected object, got ${typeof data}`);
    }
        return data as T;
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