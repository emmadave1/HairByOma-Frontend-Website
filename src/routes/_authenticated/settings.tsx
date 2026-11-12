import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserRound, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings - HairbyOma" },
      {
        name: "description",
        content: "Manage your HairbyOma personal information and account settings.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { user, setUser, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");

    const dob = user.dateOfBirth ? new Date(user.dateOfBirth) : null;

    setDateOfBirth(
      dob && !Number.isNaN(dob.getTime())
        ? dob.toISOString().slice(0, 10)
        : "",
    );
  }, [user]);

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || null,
      });

      setUser(response.user);
      setSuccess(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };


  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setPasswordError(
        "Use at least 8 characters with uppercase and lowercase letters, a number and a special character.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(response.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await signOut().catch(() => undefined);
      await navigate({ to: "/auth" });
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Unable to change your password. Please try again.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDeleteError("");

    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your HairbyOma account? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingAccount(true);

    try {
      await userService.deleteAccount(deletePassword);
      await signOut().catch(() => undefined);
      await navigate({ to: "/auth" });
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Unable to delete your account. Please try again.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };
  return (
    <div className="site-container py-10">
      <div className="mb-8">
        <p className="eyebrow">Account preferences</p>
        <h1 className="mt-2 text-3xl font-display">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and the details associated with your account.
        </p>
      </div>

      <section className="max-w-3xl border bg-white p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Personal information</p>
            <h2 className="mt-2 text-2xl font-display">
              {authLoading
                ? "Loading your profile..."
                : user
                  ? `Hello, ${user.firstName}`
                  : "Your profile"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your account information up to date.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary">
            <UserRound className="text-primary" />
          </div>
        </div>

        {authLoading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading account information...
          </div>
        ) : user ? (
          <>
            <div className="mt-6 border-t pt-5">
              <p className="text-sm text-muted-foreground">Email address</p>
              <p className="mt-1 font-medium">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                To change your email address, use the separate email verification process.
              </p>
            </div>

            <form onSubmit={handleProfileUpdate} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-first-name">First name</Label>
                  <Input
                    id="profile-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    maxLength={50}
                    autoComplete="given-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-last-name">Last name</Label>
                  <Input
                    id="profile-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    maxLength={50}
                    autoComplete="family-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Phone number</Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-dob">Date of birth</Label>
                  <Input
                    id="profile-dob"
                    type="date"
                    value={dateOfBirth}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              {success && (
                <p role="status" className="text-sm text-green-700">
                  {success}
                </p>
              )}

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  "Save profile changes"
                )}
              </Button>
            </form>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            We couldn't load your account information. Please sign in again.
          </p>
        )}
      </section>
      <section className="mt-8 max-w-3xl border bg-background p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary">
            <KeyRound className="text-primary" />
          </div>
          <div>
            <p className="eyebrow">Account security</p>
            <h2 className="mt-1 text-2xl font-display">Change Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              disabled={changingPassword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              disabled={changingPassword}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={changingPassword}
            />
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Use at least 8 characters with an uppercase letter, a lowercase
            letter, a number and a special character.
          </p>

          {passwordError && (
            <p role="alert" className="text-sm text-destructive">
              {passwordError}
            </p>
          )}

          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? (
              <>
                <Loader2 className="animate-spin" />
                Changing password...
              </>
            ) : (
              "Change password"
            )}
          </Button>
        </form>
      </section>
      <section className="mt-8 max-w-3xl border border-destructive/30 bg-background p-6 md:p-8">
        <p className="eyebrow text-destructive">Danger zone</p>
        <h2 className="mt-2 text-2xl font-display">Delete Account</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Permanently deactivate your HairbyOma account. Your personal
          information will be anonymised, but certain order records may be
          retained where necessary.
        </p>

        <form onSubmit={handleDeleteAccount} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="delete-account-password">
              Confirm your current password
            </Label>
            <Input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              required
              disabled={deletingAccount}
            />
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            You may not be able to delete your account while you have pending
            orders or unresolved refunds.
          </p>

          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          )}

          <Button
            type="submit"
            variant="destructive"
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting account...
              </>
            ) : (
              "Delete my account"
            )}
          </Button>
        </form>
      </section>
    </div>
  );
}

