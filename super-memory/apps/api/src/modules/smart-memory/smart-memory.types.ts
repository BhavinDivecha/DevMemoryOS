export const MemoryReviewTypes = [
  "duplicate",
  "conflict",
  "stale",
  "low_quality",
  "merge_suggestion",
  "scope_suggestion",
  "expiry_suggestion",
  "relation_suggestion"
] as const;

export const MemoryReviewStatuses = ["pending", "approved", "rejected", "resolved", "ignored"] as const;

export const MemoryReviewSeverity = ["low", "medium", "high", "critical"] as const;

export const MemoryRelationTypes = [
  "similar_to",
  "duplicates",
  "conflicts_with",
  "supports",
  "replaces",
  "belongs_to_project",
  "belongs_to_repo",
  "derived_from",
  "supersedes"
] as const;
