import { ConfigurableItemFullName } from "@/interfaces";

export interface FindReferencesOptions {
  /** Return only unique references */
  unique?: boolean;
  /** Maximum depth to search */
  maxDepth?: number;
  /** Custom filter function */
  filter?: (ref: ConfigurableItemFullName) => boolean;
  /** Include paths in results */
  // includePaths?: boolean;
  /** Callback for each found reference */
  onFound?: (ref: ConfigurableItemFullName, path?: string) => void;
}

export class ItemReferenceFinder {
  private static isItemReference(obj: unknown): obj is ConfigurableItemFullName {
    return (
      obj &&
      typeof obj === 'object' &&
      "name" in obj && typeof obj.name === 'string' &&
      "module" in obj && typeof obj.module === 'string' &&
      Object.keys(obj).length === 2 // Only name and module
    );
  }

  public static findAll<T>(
    obj: T,
    options: FindReferencesOptions = {},
  ): ConfigurableItemFullName[] {
    const {
      unique = false,
      maxDepth = Infinity,
      filter,
      // includePaths = false,
      onFound,
    } = options;

    const references: ConfigurableItemFullName[] = [];
    const visited = new WeakSet();
    const seen = new Set<string>();

    const traverse = (current: unknown, path: string = '', depth = 0): void => {
      if (depth > maxDepth || current == null || (typeof (current) === 'object' && visited.has(current))) {
        return;
      }

      if (typeof current === 'object') {
        visited.add(current);
      }

      // Check if it's an ConfigurableItemFullName
      if (this.isItemReference(current)) {
        if (!filter || filter(current)) {
          const key = `${current.name}:${current.module}`;

          if (!unique || !seen.has(key)) {
            seen.add(key);
            references.push(current);

            if (onFound) {
              onFound(current, path || '(root)');
            }
          }
        }
        return;
      }

      // Handle arrays
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          traverse.call(this, item, `${path}[${index}]`, depth + 1);
        });
        return;
      }

      // Handle objects (but not Dates, RegExp, etc.)
      if (typeof current === 'object' && !(current instanceof Date)) {
        Object.entries(current).forEach(([key, value]) => {
          traverse.call(this, value, path ? `${path}.${key}` : key, depth + 1);
        });
      }
    };

    traverse.call(this, obj, '', 0);
    return references;
  }

  static findAndMap<T, R>(
    obj: T,
    mapper: (ref: ConfigurableItemFullName, path?: string) => R,
    options: Omit<FindReferencesOptions, 'onFound'> = {},
  ): R[] {
    const results: R[] = [];

    this.findAll(obj, {
      ...options,
      onFound: (ref, path) => {
        results.push(mapper(ref, path));
      },
    });

    return results;
  }

  static extractUniqueModules<T>(obj: T): string[] {
    const refs = this.findAll(obj, { unique: true });
    const modules = new Set(refs.map((ref) => ref.module));
    return Array.from(modules);
  }
}
