export const groupQueryKey = {
  all: ["groups"] as const,
  detail: (id: number) => ["groups", id] as const,
};
