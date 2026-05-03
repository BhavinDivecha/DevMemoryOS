import { MemoryScopes, MemorySources, MemoryStatuses } from "../constants/memory";

export type MemoryScope = (typeof MemoryScopes)[number];
export type MemorySource = (typeof MemorySources)[number];
export type MemoryStatus = (typeof MemoryStatuses)[number];
