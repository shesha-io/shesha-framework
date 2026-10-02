

export type NestedPropertyPaths<T, Target> = T extends Target
  ? '' // If the type itself is the target, empty path
  : T extends Array<infer U>
    ? `[${number}]${NestedPropertyPaths<U, Target>}` // Handle arrays
    : T extends object
      ? {
        [K in keyof T]:
        K extends string | number
          ? T[K] extends Target
            ? `${K}` // Direct match
            : T[K] extends object
              ? `${K}.${NestedPropertyPaths<T[K], Target>}` // Nested object
              : never // Primitive that's not our target
          : never
      }[keyof T] extends infer P
        ? P extends string
          ? P
          : never
        : never
      : never; // Not an object, not our target

// Optional: Flatten to get array of paths
export type PathsToArray<T, Target> = NestedPropertyPaths<T, Target> extends string
  ? Array<NestedPropertyPaths<T, Target>>
  : never[];
