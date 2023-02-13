export interface IReferenceList {
    name: string;
    items: IReferenceListItem[];
    /**
     * Cache MD5, is used for client-side caching
     */
    cacheMd5?: string | null;
}

export interface IReferenceListItem {
    id?: string;
    item?: string | null;
    itemValue?: number;
    description?: string | null;
    orderIndex?: number;
}