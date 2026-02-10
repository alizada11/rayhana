import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  sendContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  type ContactMessagePayload,
} from "@/lib/api";

export const useSendContactMessage = () => {
  return useMutation({
    mutationFn: (payload: ContactMessagePayload) => sendContactMessage(payload),
  });
};

export const useContactMessages = (status?: "new" | "resolved") => {
  return useInfiniteQuery({
    queryKey: ["contact-messages", status],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getContactMessages({
        status,
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: lastPage => lastPage.nextCursor,
  });
};

export const useUpdateContactMessageStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "new" | "resolved" }) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });
};

export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });
};
