import { OwnerTypeProp } from "../notes/contexts";

export const normalizeOwnerType = (ownerType: OwnerTypeProp | undefined): string | undefined => {
    if (!ownerType) return undefined;
    return typeof ownerType === 'string' ? ownerType : ownerType.id;
};