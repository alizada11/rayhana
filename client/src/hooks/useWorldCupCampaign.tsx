import {
  executeWorldCupLotteryAdmin,
  deleteAllWorldCupPredictionsAdmin,
  getPublicWorldCupWinners,
  getWorldCupFinalPredictionsAdmin,
  getWorldCupFinalSettingsAdmin,
  getWorldCupFinalStage,
  getWorldCupLiveStats,
  getWorldCupLotteryDrawsAdmin,
  getWorldCupLotteryEligibilityAdmin,
  getWorldCupPredictionsAdmin,
  getWorldCupStatus,
  publishWorldCupLotteryAdmin,
  recoverWorldCupReferenceCode,
  submitWorldCupFinalPrediction,
  submitWorldCupPrediction,
  updateWorldCupFinalSettingsAdmin,
  updateWorldCupWinnerStatusAdmin,
  type WorldCupLotteryCriterion,
} from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWorldCupStatus = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "status"],
    queryFn: getWorldCupStatus,
    refetchInterval: 60_000,
  });

export const useWorldCupLiveStats = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "live-stats"],
    queryFn: getWorldCupLiveStats,
    refetchInterval: 30_000,
  });

export const useSubmitWorldCupPrediction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitWorldCupPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "live-stats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "predictions"],
      });
    },
  });
};

export const useWorldCupFinalStage = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "final-stage"],
    queryFn: getWorldCupFinalStage,
    refetchInterval: 60_000,
  });

export const useSubmitWorldCupFinalPrediction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitWorldCupFinalPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "final-predictions"],
      });
    },
  });
};

export const useRecoverWorldCupReferenceCode = () =>
  useMutation({
    mutationFn: recoverWorldCupReferenceCode,
  });

export const usePublicWorldCupWinners = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "public-winners"],
    queryFn: getPublicWorldCupWinners,
    refetchInterval: 60_000,
  });

export const useWorldCupPredictionsAdmin = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "admin", "predictions"],
    queryFn: getWorldCupPredictionsAdmin,
  });

export const useUpdateWorldCupWinnerStatusAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWorldCupWinnerStatusAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "predictions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "lottery-eligibility"],
      });
    },
  });
};

export const useDeleteAllWorldCupPredictionsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllWorldCupPredictionsAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign"],
      });
    },
  });
};

export const useWorldCupFinalSettingsAdmin = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "admin", "final-settings"],
    queryFn: getWorldCupFinalSettingsAdmin,
  });

export const useUpdateWorldCupFinalSettingsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWorldCupFinalSettingsAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "final-settings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "final-stage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "public-winners"],
      });
    },
  });
};

export const useWorldCupFinalPredictionsAdmin = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "admin", "final-predictions"],
    queryFn: getWorldCupFinalPredictionsAdmin,
  });

export const useWorldCupLotteryEligibilityAdmin = (
  criterion: WorldCupLotteryCriterion
) =>
  useQuery({
    queryKey: ["world-cup-campaign", "admin", "lottery-eligibility", criterion],
    queryFn: () => getWorldCupLotteryEligibilityAdmin(criterion),
  });

export const useExecuteWorldCupLotteryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: executeWorldCupLotteryAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "lottery-draws"],
      });
    },
  });
};

export const useWorldCupLotteryDrawsAdmin = () =>
  useQuery({
    queryKey: ["world-cup-campaign", "admin", "lottery-draws"],
    queryFn: getWorldCupLotteryDrawsAdmin,
  });

export const usePublishWorldCupLotteryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishWorldCupLotteryAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "admin", "lottery-draws"],
      });
      queryClient.invalidateQueries({
        queryKey: ["world-cup-campaign", "public-winners"],
      });
    },
  });
};
