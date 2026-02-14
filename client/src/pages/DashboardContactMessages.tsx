import {
  useContactMessages,
  useDeleteContactMessage,
  useUpdateContactMessageStatus,
} from "@/hooks/useContactMessages";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Loader2,
  MailOpen,
  RefreshCcw,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";
import { useTranslation } from "react-i18next";

export default function DashboardContactMessages() {
  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContactMessages();
  const updateStatus = useUpdateContactMessageStatus();
  const deleteMutation = useDeleteContactMessage();
  const confirm = useConfirm();

  const { t, i18n } = useTranslation();
  const isRTL = ["fa", "ps"].includes(i18n.language);
  const messages = data?.pages.flatMap(page => page.items) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Contact Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage contact form submissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            aria-label="Refresh messages"
            title="Refresh messages"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-5 h-5" />
            )}
          </Button>
          {hasNextPage && (
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Load more"
              )}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-muted-foreground text-sm">No messages yet.</div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className="relative border rounded-xl p-4 bg-card shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {msg.name}
                    </h3>
                    <Badge
                      variant={
                        msg.status === "resolved" ? "secondary" : "default"
                      }
                    >
                      {msg.status === "resolved" ? "Resolved" : "New"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {msg.email}
                  </div>
                  {msg.subject && (
                    <div className="text-sm text-foreground">
                      <span className="font-medium">Subject:</span>{" "}
                      {msg.subject}
                    </div>
                  )}
                  <p className="text-foreground whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")}
                  </div>
                </div>
                <div
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-3 flex flex-col gap-2`}
                >
                  <Button
                    size="sm"
                    variant={msg.status === "resolved" ? "outline" : "default"}
                    aria-label={
                      msg.status === "resolved"
                        ? "Mark as new"
                        : "Mark as resolved"
                    }
                    title={
                      msg.status === "resolved"
                        ? "Mark as new"
                        : "Mark as resolved"
                    }
                    onClick={() =>
                      updateStatus.mutate(
                        {
                          id: msg.id,
                          status:
                            msg.status === "resolved" ? "new" : "resolved",
                        },
                        {
                          onSuccess: () => {
                            toast.success("Status updated");
                          },
                          onError: () => toast.error("Failed to update"),
                        }
                      )
                    }
                  >
                    {msg.status === "resolved" ? (
                      <MailOpen className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    aria-label="Delete message"
                    title="Delete message"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Delete this message?",
                        description:
                          "This will permanently remove the contact submission.",
                        confirmText: "Delete",
                        cancelText: "Cancel",
                        tone: "danger",
                      });
                      if (!ok) return;
                      deleteMutation.mutate(msg.id, {
                        onSuccess: () => toast.success("Message deleted"),
                        onError: () => toast.error("Delete failed"),
                      });
                    }}
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
