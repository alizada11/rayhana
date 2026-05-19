import {
  createPreLaunchReservation,
  createPreLaunchReservationAdmin,
  deletePreLaunchReservationAdmin,
  getMyPreLaunchReservations,
  getPreLaunchReservationsAdmin,
  updatePreLaunchReservationAdmin,
  type PreLaunchReservation,
  type PreLaunchReservationPayload,
  type PreLaunchReservationStatus,
} from "@/lib/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useCreatePreLaunchReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PreLaunchReservationPayload) =>
      createPreLaunchReservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-launch-reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["my-pre-launch-reservations"],
      });
    },
  });
};

export const useMyPreLaunchReservations = (enabled: boolean) => {
  return useQuery<PreLaunchReservation[]>({
    queryKey: ["my-pre-launch-reservations"],
    queryFn: getMyPreLaunchReservations,
    enabled,
  });
};

export const usePreLaunchReservationsAdmin = (filters: {
  product?: string;
  region?: string;
  status?: PreLaunchReservationStatus | "all";
  search?: string;
}) => {
  return useInfiniteQuery<{
    items: PreLaunchReservation[];
    nextCursor: string | null;
  }>({
    queryKey: ["pre-launch-reservations", filters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getPreLaunchReservationsAdmin({
        ...filters,
        cursor: (pageParam as string | null | undefined) ?? null,
        limit: 20,
      }),
    getNextPageParam: last => last.nextCursor,
  });
};

export const useCreatePreLaunchReservationAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPreLaunchReservationAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-launch-reservations"] });
    },
  });
};

export const useUpdatePreLaunchReservationAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePreLaunchReservationAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-launch-reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["my-pre-launch-reservations"],
      });
    },
  });
};

export const useDeletePreLaunchReservationAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePreLaunchReservationAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-launch-reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["my-pre-launch-reservations"],
      });
    },
  });
};
