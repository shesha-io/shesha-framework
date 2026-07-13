import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

/**
 * Represents a reference to an entity
 */
export type OwnerEntityReference = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type of the owner entity
   */
  ownerType: string | IEntityTypeIdentifier;
};

export type RecursivePartial<T> = NonNullable<T> extends object ? {
  [P in keyof T]?: NonNullable<T[P]> extends (infer U)[] ? RecursivePartial<U>[] : NonNullable<T[P]> extends object ? RecursivePartial<T[P]> : T[P];
} : T;
