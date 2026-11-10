import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  customWigOrderService,
  type AdminCustomWigOrder,
  type CustomWigOrderListParams,
  type CustomWigOrderStatus,
} from "@/services/custom-wig-order.service";

const PAGE_SIZE = 10;

const statusOptions: CustomWigOrderStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTED",
  "APPROVED",
  "REJECTED",
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PRODUCTION",
  "QUALITY_CHECK",
  "READY_FOR_DISPATCH",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "QUOTE_EXPIRED",
];

const nextStatuses: Partial<Record<CustomWigOrderStatus, CustomWigOrderStatus[]>> = {
  PAID: ["IN_PRODUCTION"],
  IN_PRODUCTION: ["QUALITY_CHECK"],
  QUALITY_CHECK: ["IN_PRODUCTION", "READY_FOR_DISPATCH"],
  READY_FOR_DISPATCH: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
};

function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(value?: number | null, currency = "NGN") {
  if (value === undefined || value === null) return "Not quoted";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getCustomerName(request: AdminCustomWigOrder) {
  const firstName = request.user?.firstName || "";
  const lastName = request.user?.lastName || "";
  return `${firstName} ${lastName}`.trim() || "Unknown customer";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className="whitespace-nowrap">
      {formatLabel(status)}
    </Badge>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 sm:flex-row sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground sm:max-w-[65%] sm:text-right">
        {value === undefined || value === null || value === "" ? "—" : value}
      </span>
    </div>
  );
}

export default function CustomWigOrdersManagement() {
  const [requests, setRequests] = useState<AdminCustomWigOrder[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminCustomWigOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const params: CustomWigOrderListParams = {
          page,
          limit: PAGE_SIZE,
        };

        if (statusFilter) {
          params.status = statusFilter as CustomWigOrderStatus;
        }

        const response = await customWigOrderService.list(params);

        setRequests(response.requests || []);
        setTotalRequests(response.totalRequests || 0);
        setTotalPages(Math.max(response.totalPages || 1, 1));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load custom wig orders.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter],
  );

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const openDetails = async (id: string) => {
    setDetailsLoading(true);
    setSelectedRequest(null);

    try {
      const response = await customWigOrderService.getById(id);
      setSelectedRequest(response.request);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load request details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshSelectedRequest = async (id: string) => {
    const response = await customWigOrderService.getById(id);
    setSelectedRequest(response.request);
  };

  const handleQuotation = async () => {
    if (!selectedRequest) return;

    const amountInput = window.prompt(
      "Enter the quotation amount in NGN:",
      selectedRequest.quoteAmount?.toString() || "",
    );

    if (amountInput === null) return;

    const quoteAmount = Number(amountInput);

    if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) {
      toast.error("Enter a valid quotation amount greater than zero.");
      return;
    }

    const quoteNote = window.prompt(
      "Add an optional note for the customer:",
      selectedRequest.quoteNote || "",
    );

    if (quoteNote === null) return;

    if (quoteNote.trim().length > 1000) {
      toast.error("The quotation note cannot exceed 1,000 characters.");
      return;
    }

    const validityInput = window.prompt(
      "How many days should the quotation remain valid? (1–30)",
      "7",
    );

    if (validityInput === null) return;

    const validityDays = Number(validityInput);

    if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 30) {
      toast.error("Quotation validity must be between 1 and 30 days.");
      return;
    }

    setActionLoading(true);

    try {
      await customWigOrderService.sendQuotation(selectedRequest._id, {
        quoteAmount,
        quoteNote: quoteNote.trim(),
        validityDays,
      });

      toast.success("Quotation sent successfully.");
      await Promise.all([loadRequests(true), refreshSelectedRequest(selectedRequest._id)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send quotation.");
    } finally {
      setActionLoading(false);
    }
  };

  const canVerifyPayment = (request: AdminCustomWigOrder) =>
    request.status === "AWAITING_PAYMENT" &&
    request.paymentMethod === "BANK_TRANSFER" &&
    request.paymentStatus === "PENDING" &&
    request.paymentReceiptSubmitted;

  const handleConfirmPayment = async () => {
    if (!selectedRequest || !canVerifyPayment(selectedRequest)) return;

    const confirmed = window.confirm(
      "Have you independently verified that the customer's transfer was received in the store's bank account? Only confirm if the actual bank credit has been verified.",
    );

    if (!confirmed) return;

    setActionLoading(true);

    try {
      await customWigOrderService.confirmPayment(selectedRequest._id);
      toast.success("Payment confirmed successfully.");
      await Promise.all([loadRequests(true), refreshSelectedRequest(selectedRequest._id)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to confirm payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedRequest || !canVerifyPayment(selectedRequest)) return;

    const reason = window.prompt("Enter the reason for rejecting this payment:");

    if (reason === null) return;

    if (!reason.trim() || reason.trim().length > 500) {
      toast.error("Enter a reason of no more than 500 characters.");
      return;
    }

    setActionLoading(true);

    try {
      await customWigOrderService.rejectPayment(selectedRequest._id, reason.trim());
      toast.success("Payment submission rejected.");
      await Promise.all([loadRequests(true), refreshSelectedRequest(selectedRequest._id)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reject payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (status: CustomWigOrderStatus) => {
    if (!selectedRequest) return;

    const note = window.prompt(`Optional note for moving this request to ${formatLabel(status)}:`);

    if (note === null) return;

    if (note.trim().length > 1000) {
      toast.error("The status note cannot exceed 1,000 characters.");
      return;
    }

    setActionLoading(true);

    try {
      await customWigOrderService.updateStatus(selectedRequest._id, {
        status,
        note: note.trim(),
      });

      toast.success(`Request updated to ${formatLabel(status)}.`);
      await Promise.all([loadRequests(true), refreshSelectedRequest(selectedRequest._id)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update request status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage customer wig requests, quotations, payments and production.
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">Custom Wig Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalRequests} {totalRequests === 1 ? "request" : "requests"} found
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRequests(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          Filter by status
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Could not load custom wig requests</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void loadRequests(true)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading custom wig requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <p className="font-medium text-foreground">No custom wig requests found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New customer requests will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Request</th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Wig type</th>
                    <th className="px-5 py-4 font-medium">Quotation</th>
                    <th className="px-5 py-4 font-medium">Payment</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                        {request.requestNumber}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{getCustomerName(request)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.user?.email || "No email"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-foreground">{formatLabel(request.wigType)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-foreground">
                        {formatCurrency(request.quoteAmount, request.quoteCurrency)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={request.paymentStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void openDetails(request._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {(detailsLoading || selectedRequest) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !actionLoading) {
              setSelectedRequest(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-wig-details-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h3 id="custom-wig-details-title" className="text-lg font-semibold text-foreground">
                  Custom wig request details
                </h3>
                {selectedRequest && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRequest.requestNumber}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                disabled={actionLoading}
                aria-label="Close details"
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailsLoading || !selectedRequest ? (
              <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading request details...
              </div>
            ) : (
              <div className="overflow-y-auto px-5 py-5 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <section>
                    <h4 className="font-semibold text-foreground">Customer information</h4>
                    <div className="mt-2">
                      <DetailRow label="Name" value={getCustomerName(selectedRequest)} />
                      <DetailRow label="Email" value={selectedRequest.user?.email} />
                      <DetailRow label="Phone" value={selectedRequest.user?.phone} />
                      <DetailRow
                        label="Request date"
                        value={formatDate(selectedRequest.createdAt)}
                      />
                    </div>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground">Request status</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={selectedRequest.status} />
                      <StatusBadge status={selectedRequest.paymentStatus} />
                    </div>
                    <div className="mt-2">
                      <DetailRow
                        label="Last updated"
                        value={formatDate(selectedRequest.updatedAt)}
                      />
                      <DetailRow label="Request number" value={selectedRequest.requestNumber} />
                    </div>
                  </section>
                </div>

                <section className="mt-7">
                  <h4 className="font-semibold text-foreground">Wig specifications</h4>
                  <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
                    <DetailRow label="Wig type" value={formatLabel(selectedRequest.wigType)} />
                    <DetailRow label="Hair type" value={formatLabel(selectedRequest.hairType)} />
                    <DetailRow label="Texture" value={formatLabel(selectedRequest.texture)} />
                    <DetailRow label="Length" value={`${selectedRequest.length} inches`} />
                    <DetailRow label="Density" value={`${selectedRequest.density}%`} />
                    <DetailRow label="Colour" value={selectedRequest.colour} />
                    <DetailRow label="Lace type" value={formatLabel(selectedRequest.laceType)} />
                    <DetailRow label="Cap size" value={formatLabel(selectedRequest.capSize)} />
                    <DetailRow label="Wig style" value={formatLabel(selectedRequest.wigStyle)} />
                    <DetailRow
                      label="Parting style"
                      value={formatLabel(selectedRequest.partingStyle)}
                    />
                  </div>
                  {selectedRequest.specialInstructions && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Special instructions
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                        {selectedRequest.specialInstructions}
                      </p>
                    </div>
                  )}
                </section>

                <section className="mt-7">
                  <h4 className="font-semibold text-foreground">Reference images</h4>
                  {selectedRequest.referenceImages?.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                      {selectedRequest.referenceImages.map((image, index) => (
                        <a
                          key={`${image.publicId}-${index}`}
                          href={image.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group overflow-hidden rounded-lg border border-border"
                        >
                          <img
                            src={image.url}
                            alt={`Customer reference ${index + 1}`}
                            loading="lazy"
                            className="aspect-square w-full object-cover transition group-hover:scale-105"
                          />
                          <span className="block px-2 py-1 text-center text-xs text-muted-foreground">
                            View image
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No reference images provided.
                    </p>
                  )}
                </section>

                <section className="mt-7">
                  <h4 className="font-semibold text-foreground">Quotation and customer response</h4>
                  <div className="mt-2">
                    <DetailRow
                      label="Quoted amount"
                      value={formatCurrency(
                        selectedRequest.quoteAmount,
                        selectedRequest.quoteCurrency,
                      )}
                    />
                    <DetailRow label="Quotation note" value={selectedRequest.quoteNote} />
                    <DetailRow
                      label="Quotation sent"
                      value={formatDate(selectedRequest.quotedAt)}
                    />
                    <DetailRow
                      label="Quotation expires"
                      value={formatDate(selectedRequest.quoteExpiresAt)}
                    />
                    <DetailRow
                      label="Customer approved"
                      value={formatDate(selectedRequest.customerApprovedAt)}
                    />
                    <DetailRow
                      label="Customer rejected"
                      value={formatDate(selectedRequest.customerRejectedAt)}
                    />
                    <DetailRow
                      label="Customer response"
                      value={selectedRequest.customerResponseNote}
                    />
                  </div>
                </section>

                <section className="mt-7">
                  <h4 className="font-semibold text-foreground">Payment information</h4>
                  <div className="mt-2">
                    <DetailRow
                      label="Payment method"
                      value={formatLabel(selectedRequest.paymentMethod)}
                    />
                    <DetailRow
                      label="Payment status"
                      value={formatLabel(selectedRequest.paymentStatus)}
                    />
                    <DetailRow label="Payment reference" value={selectedRequest.paymentReference} />
                    <DetailRow
                      label="Receipt submitted"
                      value={selectedRequest.paymentReceiptSubmitted ? "Yes" : "No"}
                    />
                    <DetailRow
                      label="Receipt submission date"
                      value={formatDate(selectedRequest.paymentReceiptSubmittedAt)}
                    />
                    <DetailRow
                      label="Payment confirmed"
                      value={formatDate(selectedRequest.paymentConfirmedAt)}
                    />
                    <DetailRow label="Payment note" value={selectedRequest.paymentNote} />
                  </div>
                  {selectedRequest.paymentReceiptSubmitted && (
                    <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      The customer has indicated that a receipt was submitted. Verify the actual
                      bank credit independently. Receipt images are shared through the existing
                      WhatsApp process and are not stored in this request record.
                    </p>
                  )}
                  {selectedRequest.order && (
                    <div className="mt-4 rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold text-foreground">Linked order</p>
                      <div className="mt-2">
                        <DetailRow label="Order number" value={selectedRequest.order.orderNumber} />
                        <DetailRow
                          label="Order status"
                          value={formatLabel(selectedRequest.order.orderStatus)}
                        />
                        <DetailRow
                          label="Order payment"
                          value={formatLabel(selectedRequest.order.paymentStatus)}
                        />
                        <DetailRow
                          label="Order total"
                          value={formatCurrency(selectedRequest.order.totalAmount)}
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="mt-7">
                  <h4 className="font-semibold text-foreground">Status history</h4>
                  {selectedRequest.statusHistory?.length ? (
                    <div className="mt-3 space-y-3">
                      {selectedRequest.statusHistory
                        .filter((entry) => entry.isVisibleToCustomer)
                        .slice()
                        .reverse()
                        .map((entry, index) => (
                          <div
                            key={entry._id || `${entry.status}-${index}`}
                            className="border-l-2 border-primary/40 pl-4"
                          >
                            <p className="text-sm font-medium text-foreground">
                              {formatLabel(entry.status)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(entry.changedAt)}
                            </p>
                            {entry.note && (
                              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No customer-visible status history yet.
                    </p>
                  )}
                </section>

                <section className="mt-8 border-t border-border pt-6">
                  <h4 className="font-semibold text-foreground">Admin actions</h4>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["SUBMITTED", "UNDER_REVIEW", "QUOTE_EXPIRED"].includes(
                      selectedRequest.status,
                    ) && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void handleQuotation()}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                      >
                        Send quotation
                      </button>
                    )}

                    {canVerifyPayment(selectedRequest) && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => void handleConfirmPayment()}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                        >
                          Confirm bank payment
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => void handleRejectPayment()}
                          className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
                        >
                          Reject payment
                        </button>
                      </>
                    )}

                    {(nextStatuses[selectedRequest.status] || []).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void handleStatusUpdate(nextStatus)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                      >
                        Move to {formatLabel(nextStatus)}
                      </button>
                    ))}
                  </div>

                  {actionLoading && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing action...
                    </p>
                  )}

                  {!actionLoading &&
                    !["SUBMITTED", "UNDER_REVIEW", "QUOTE_EXPIRED"].includes(
                      selectedRequest.status,
                    ) &&
                    !canVerifyPayment(selectedRequest) &&
                    !nextStatuses[selectedRequest.status]?.length && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No admin actions are currently available for this request status.
                      </p>
                    )}
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
