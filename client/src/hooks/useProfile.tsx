import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
  type GuestProfile,
} from "@/lib/api";

export const useProfile = () =>
  useQuery<GuestProfile>({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: data => {
      qc.setQueryData(["profile"], data);
      qc.setQueryData(["me"], { role: data.role });
    },
  });
};

export const useChangePassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: changeMyPassword,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
