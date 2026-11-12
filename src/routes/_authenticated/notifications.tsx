import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  Inbox,
  Loader2,
  Megaphone,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  notificationService,
  type CustomerNotification,
} from "@/services/notification.service";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - HairbyOma" },
      {
        name: "description",
        content: "View your latest HairbyOma account and order notifications.",
      },
    ],
  }),
  component: NotificationsPage,
});

type NotificationFilter = "all" | "unread";

const getNotificationIcon = (type: string) => {
  if (type.includes("ORDER") || type.includes("CUSTOM_WIG")) return Package;
  if (type.includes("PAYMENT") || type.includes("REFUND")) return CreditCard;
  if (type.includes("LOYALTY") || type.includes("REFERRAL")) return Gift;
  if (type.includes("APPOINTMENT")) return CalendarDays;
  if (type.includes("PRODUCT") || type.includes("BACK_IN_STOCK")) return Star;
  if (type.includes("ANNOUNCEMENT") || type.includes("CAMPAIGN")) return Megaphone;
  if (type.includes("BIRTHDAY") || type.includes("REVAMPING")) return Sparkles;
  if (type.includes("PASSWORD") || type.includes("ACCOUNT")) return ShieldCheck;
  return Bell;
};

const getNotificationCategory = (type: string) => {
  if (type.includes("ORDER") || type.includes("CUSTOM_WIG")) return "Orders";
  if (type.includes("PAYMENT") || type.includes("REFUND")) return "Payments";
  if (type.includes("LOYALTY") || type.includes("REFERRAL")) return "Rewards";
  if (type.includes("APPOINTMENT")) return "Appointments";
  if (type.includes("PRODUCT")) return "Products";
  if (type.includes("ANNOUNCEMENT") || type.includes("CAMPAIGN")) return "Announcements";
  if (type.includes("BIRTHDAY") || type.includes("REVAMPING")) return "Special updates";
  if (type.includes("PASSWORD") || type.includes("ACCOUNT")) return "Account";
  return "Updates";
};

const formatNotificationDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const difference = now.getTime() - date.getTime();
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await notificationService.getMyNotifications(page, 20);

      setNotifications(response.notifications);
      setPages(Math.max(1, response.pages));
      setTotal(response.total);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notification: CustomerNotification) => {
    if (notification.isRead || markingId) return;

    setMarkingId(notification._id);
    setError("");

    try {
      await notificationService.markAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark this notification as read.",
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    setError("");

    try {
      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark all notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const visibleNotifications =
    filter === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Stay up to date</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Notifications</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Important updates about your orders, payments, rewards and HairbyOma account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <BellRing className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{unreadCount}</p>
            <p className="text-xs text-muted-foreground">Unread updates</p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                filter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                filter === "unread"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Unread
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void handleMarkAllAsRead()}
            disabled={unreadCount === 0 || markingAll || loading}
          >
            {markingAll ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Marking all as read...
              </>
            ) : (
              <>
                <CheckCheck className="mr-2 size-4" />
                Mark all as read
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading your notifications...
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <Inbox className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl">No notifications yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You will see order updates, rewards and account alerts here when they arrive.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification._id}
                  className={`rounded-xl border p-4 transition ${
                    isUnread ? "border-primary/25 bg-primary/5" : "bg-card"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full ${
                          isUnread ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{notification.title || "Notification"}</p>
                          {isUnread && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary-foreground">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.message || "You have a new update."}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{getNotificationCategory(notification.type)}</span>
                          <span>•</span>
                          <span>{formatNotificationDate(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleMarkAsRead(notification)}
                          disabled={markingId === notification._id}
                        >
                          {markingId === notification._id ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Marking...
                            </>
                          ) : (
                            <>
                              <CheckCheck className="mr-2 size-4" />
                              Mark read
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pages} • {total} notifications
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="mr-1 size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pages || loading}
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
              >
                Next
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {!loading && total === 0 && !error && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4" />
            Refresh to see new alerts.
          </div>
        )}
      </section>
    </div>
  );
}
