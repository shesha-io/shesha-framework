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
