export const MESSAGE_PAGE_SIZE = 50;

export const messageQueryKey = {
  list: (conversationId: number) => ["messages", conversationId] as const,
};
