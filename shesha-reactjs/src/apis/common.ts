/**
 * Generic entity reference Dto
 */
export interface GuidEntityReferenceDto {
    id?: string;
    /**
     * Entity display name
     */
    _displayName?: string | null;
    /**
     * Entity class name
     */
    _className?: string | null;
}