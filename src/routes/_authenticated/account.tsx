import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gift,
  Heart,
  Package,
  Settings,
  Share2,
  Trophy,
  Cake,
  UserRound,
  Loader2,
} from "lucide-react";
import { PageHero, MockNotice, ProgressMeter } from "@/components/shared";
import { siteConfig } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { userService } from "@/services/user.service";
import { AddressManager } from "@/components/account/AddressManager";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account - HairbyOma" },
      {
        name: "description",
        content: "Manage your HairbyOma customer account and profile.",
      },
      { property: "og:title", content: "HairbyOma Customer Account" },
      {
        property: "og:description",
        content: "Manage your HairbyOma customer account.",
      },
    ],
  }),
  component: Page,
});

const sections = [
  [Package, "Orders", "View your purchases", "/order-confirmation"],
  [Heart, "Wishlist", "Your saved pieces", "/wishlist"],
  [Cake, "Birthday", "Birthday benefits", "/birthday-club"],
  [Gift, "Rewards", "Your loyalty benefits", "/rewards"],
  [Share2, "Referrals", "Invite friends", "/referrals"],
  [Trophy, "Annual Challenge", "Your yearly progress", "/annual-challenge"],
] as const;

function Page() {
  const { user, setUser, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");

    const dob = user.dateOfBirth
      ? new Date(user.dateOfBirth)
      : null;

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

  return (
    <>
      <PageHero
        eyebrow="Your personal space"
        title="Your account"
        copy="Manage your profile, orders and HairbyOma benefits."
      />

      <div className="site-container py-10">
        <section className="border p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                Manage the information associated with your account.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
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
                  To change your email address, use the separate email
                  verification process.
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
                      onChange={(event) =>
                        setDateOfBirth(event.target.value)
                      }
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

        <AddressManager />

        <div className="mt-8 grid gap-5 md:grid-cols-[1.6fr_1fr]">
          <div className="border p-7">
            <p className="eyebrow">2026 progress</p>
            <h2 className="mt-2 text-3xl">
              ?{siteConfig.rewards.purchased.toLocaleString()} purchased
            </h2>
            <div className="mt-6">
              <ProgressMeter label="Annual target" value={65} />
            </div>
          </div>

          <div className="bg-secondary/45 p-7">
            <p className="text-sm text-muted-foreground">Next reward</p>
            <p className="mt-2 text-2xl font-display">
              Complimentary care set
            </p>
            <p className="mt-4 text-sm">?350,000 remaining</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(([Icon, title, copy, to]) => (
            <Link
              key={title}
              to={to}
              className="border p-5 transition hover:border-primary hover:bg-muted"
            >
              <Icon className="text-primary" />
              <h2 className="mt-4 text-xl">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <MockNotice>
            Order history, loyalty points and annual challenge figures will be
            connected to their respective backend services.
          </MockNotice>
        </div>
      </div>
    </>
  );
}

