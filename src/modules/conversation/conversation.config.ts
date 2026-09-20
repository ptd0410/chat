export const CONVERSATION_PAGE_SIZE = 30;

export const conversationQueryKey = {
  list: ["conversations"] as const,
  detail: (id: number) => ["conversations", "detail", id] as const,
};
