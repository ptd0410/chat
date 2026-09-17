export const messageQueryKey = {
  list: (conversationId: number) => ["messages", conversationId] as const,
};
