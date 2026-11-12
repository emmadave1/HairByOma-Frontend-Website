import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LockKeyhole, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

type ResetPasswordSearch = {
  token?: string;
};

export const Route = createFileRoute("/reset-password")({
  ssr: false,

  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    ...(typeof search["token"] === "string"
      ? { token: search["token"] }
      : {}),
  }),

  head: () => ({
    meta: [
      { title: "Reset Password - HairbyOma" },
      {
        name: "description",
        content: "Create a new password for your HairbyOma account.",
      },
    ],
  }),

  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "This password reset link is invalid. Please request a new one.",
      );
      return;
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setError(
        "Your password must contain at least 8 characters, including uppercase and lowercase letters, a number and a special character.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        token,
        newPassword,
      });

      setSuccess(
        response.message || "Your password has been reset successfully.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password. Please request a new link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-container py-14 md:py-20">
      <div className="mx-auto max-w-lg border bg-background p-6 shadow-sm md:p-9">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary">
            {success ? (
              <ShieldCheck className="text-primary" />
            ) : (
              <LockKeyhole className="text-primary" />
            )}
          </span>

          <h1 className="mt-5 text-3xl md:text-4xl">
            {success ? "Password Reset Successful" : "Create a New Password"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {success
              ? "Your password has been updated. You can now sign in using your new password."
              : "Choose a strong password to secure your HairbyOma account."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-md border border-green-600/30 bg-green-600/5 p-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {!success && (
          <form
            onSubmit={handleResetPassword}
            className="mt-8 space-y-5"
          >
            {!token && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                This reset link is missing its token. Please request a new
                password reset link.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                disabled={loading || !token}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                disabled={loading || !token}
              />
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Use at least 8 characters with an uppercase letter, a lowercase
              letter, a number and a special character.
            </p>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !token}
            >
              {loading && <Loader2 className="animate-spin" />}
              Reset Password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
