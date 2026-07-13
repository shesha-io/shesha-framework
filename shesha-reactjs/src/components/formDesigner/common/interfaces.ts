import { StringSubtype } from "@/interfaces/utilityTypes";

export const CONTAINER_DIRECTIONS = ["horizontal", "vertical"] as const;
export type ContainerDirection = StringSubtype<typeof CONTAINER_DIRECTIONS>;


