import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LockKeyhole, Loader2, MailCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/auth";
import { authService } from "@/services/auth.service";

type AuthSearch = {
  next?: string;
  ref?: string;
};

type AuthMode = "login" | "register" | "verify";

const safeNext = (value?: string) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : "/account";

export const Route = createFileRoute("/auth")({
  ssr: false,

  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    ...(typeof search["next"] === "string" ? { next: search["next"] } : {}),
    ...(typeof search["ref"] === "string" ? { ref: search["ref"] } : {}),
  }),

  head: () => ({
    meta: [
      { title: "Account Access - HairbyOma" },
      {
        name: "description",
        content:
          "Sign in or create your HairbyOma account to enjoy a personalised shopping experience.",
      },
    ],
  }),

  component: AuthPage,
});

function AuthPage() {
  const { next, ref } = Route.useSearch();
  const destination = safeNext(next);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [referralCode, setReferralCode] = useState(ref ?? "");
  const [verificationCode, setVerificationCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!resendCooldown) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const changeMode = (value: string) => {
    setMode(value as AuthMode);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      setUser(response.user);
      await navigate({ to: destination as never });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(dateOfBirth ? { dateOfBirth } : {}),
        ...(referralCode.trim() ? { referralCode: referralCode.trim().toUpperCase() } : {}),
      });

      setEmail(response.email);
      setPassword("");
      setVerificationCode("");
      setMode("verify");
      setSuccess(response.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Please enter your complete six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyEmail({
        email,
        code: verificationCode,
      });

      setSuccess(response.message);
      setVerificationCode("");
      setMode("login");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify your email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.resendVerification(email);

      setSuccess(response.message);
      setResendCooldown(60);
      setVerificationCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend your verification code.");

      if (typeof err === "object" && err !== null && "data" in err) {
        const data = err.data;

        if (
          typeof data === "object" &&
          data !== null &&
          "remainingSeconds" in data &&
          typeof data.remainingSeconds === "number"
        ) {
          setResendCooldown(data.remainingSeconds);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-container py-14 md:py-20">
      <div className="mx-auto max-w-lg border bg-background p-6 shadow-sm md:p-9">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary">
            {mode === "verify" ? (
              <MailCheck className="text-primary" />
            ) : (
              <LockKeyhole className="text-primary" />
            )}
          </span>

          <h1 className="mt-5 text-3xl md:text-4xl">
            {mode === "verify"
              ? "Verify Your Email"
              : mode === "register"
                ? "Create Your Account"
                : "Welcome Back"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {mode === "verify"
              ? `Enter the six-digit verification code sent to ${email}.`
              : mode === "register"
                ? "Join HairbyOma for a personalised shopping experience."
                : "Sign in to access your account and continue shopping."}
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

        {mode === "verify" ? (
          <form onSubmit={handleVerify} className="mt-8 space-y-6">
            <div className="space-y-3">
              <Label className="block text-center">Verification Code</Label>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  pattern="^[0-9]+$"
                  inputMode="numeric"
                  disabled={loading}
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="size-11 rounded-md border"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Your verification code expires after 10 minutes.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading && <Loader2 className="animate-spin" />}
              Verify Email
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Didn't receive a code? </span>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
                className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to registration
            </button>
          </form>
        ) : (
          <Tabs value={mode} onValueChange={changeMode} className="mt-8">
            <TabsList className="grid h-11 w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="mt-5 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="First name"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Last name"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="Your phone number"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-of-birth">Date of Birth (Optional)</Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    autoComplete="bday"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    At least 8 characters, including uppercase and lowercase letters, a number and a
                    special character.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                  <Input
                    id="referral-code"
                    placeholder="Enter a referral code"
                    value={referralCode}
                    onChange={(event) => setReferralCode(event.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  Create Account
                </Button>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  By creating an account, you agree to provide accurate information and keep your
                  login details secure.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" />
          Secure account access
        </div>

        <Button asChild variant="ghost" className="mt-3 w-full">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
