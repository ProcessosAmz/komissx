import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const CREATED_USER_HIGHLIGHT_QUERY_KEY = ["created-user-highlight"] as const;

export type CreatedUserHighlight = {
  userId: string;
} | null;

export function useCreatedUserHighlight() {
  const queryClient = useQueryClient();
  const { data } = useQuery<CreatedUserHighlight>({
    queryKey: CREATED_USER_HIGHLIGHT_QUERY_KEY,
    queryFn: () => Promise.resolve(null),
    initialData: null,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const setHighlight = useCallback(
    (userId: string) => {
      queryClient.setQueryData<CreatedUserHighlight>(
        CREATED_USER_HIGHLIGHT_QUERY_KEY,
        { userId },
      );
    },
    [queryClient],
  );

  const clearHighlight = useCallback(() => {
    queryClient.setQueryData<CreatedUserHighlight>(
      CREATED_USER_HIGHLIGHT_QUERY_KEY,
      null,
    );
  }, [queryClient]);

  return {
    highlightId: data?.userId ?? "",
    setHighlight,
    clearHighlight,
  };
}
