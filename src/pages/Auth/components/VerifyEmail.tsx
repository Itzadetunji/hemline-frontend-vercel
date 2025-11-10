import { zodResolver } from "@hookform/resolvers/zod";
import type { JSX } from "preact";
import { useLocation } from "preact-iso";
import { useEffect, useRef, useState } from "preact/hooks";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

import { useGetMagicLink, useVeriftMagicCode } from "@/api/http/v1/users/users.hooks";
import { type RequestMagicLinkPayload, type VerifyMagicCodePayload, VerifyMagicCodeSchema } from "@/api/http/v1/users/users.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { clearEmail, emailSignal, setEmail } from "@/stores/authStore";

export const VerifyEmail = () => {
  const location = useLocation();

  const formMethods = useForm<VerifyMagicCodePayload>({
    resolver: zodResolver(VerifyMagicCodeSchema),
  });

  const verifyMagicCodeMutation = useVeriftMagicCode();

  const onSubmit: SubmitHandler<VerifyMagicCodePayload> = async (payload) => {
    await verifyMagicCodeMutation.mutateAsync(payload, {
      onSuccess: (data) => {
        console.log(data);

        // Navigate based on onboarding status
        if (data.data.user.has_onboarded) location.route("/");
        else location.route("/onboarding");

        clearEmail();
      },
      onError: (error) => {
        console.error("Error verifying code:", error);
        if (error.status === 422)
          return formMethods.setError("code", {
            type: "manual",
            message: error.response?.data?.error,
          });

        formMethods.setError("code", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        });
      },
    });
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  return (
    <main class="flex h-[100dvh] flex-col items-stretch gap-9.5 px-4 py-4">
      <div class="flex flex-col gap-10">
        <img src="/assets/brand/logo.svg" class="size-9" alt="Brand Logo" />
        <div class="flex flex-col gap-6">
          <h1 class="text-5xl leading-10.5">Verify your email</h1>
          <p class="text-grey-400 text-sm">We sent a login link to {emailSignal.value}. Click on the link to login into your account.</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <hr class="flex-1 border-line-700" /> <p>Or</p>
      </div>
      <form class="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
        <Label class="flex flex-col items-stretch gap-4">
          <div class="flex flex-col gap-4">
            <h2 class="text-2xl leading-0">Login with Otp : {localStorage.getItem("magic-code")}</h2>
            <p class="font-medium text-grey-400 text-sm">Enter the six digit code we sent with the link below.</p>
          </div>
          <div class="flex w-full items-center gap-3 px-4">
            <Controller name="code" control={formMethods.control} render={({ field }) => (<InputOTPGroup value={String(field.value || "")} onChange={field.onChange} />) as any} />
          </div>
          {formMethods.formState.errors.code && <p class="text-red-500 text-xs">{formMethods.formState.errors.code.message}</p>}
        </Label>

        <div class="flex flex-col gap-3">
          <Button class="w-full gap-3" type="submit" disabled={verifyMagicCodeMutation.isPending}>
            Verify
          </Button>
          <ResendEmail />
        </div>
      </form>
      <p class="text-center text-grey-400 text-sm">
        By continuing, you agree to our <br />{" "}
        <a href="terms-and-conditions" class="underline" target="_blank" rel="noopener">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="privacy-policy" class="underline" target="_blank" rel="noopener">
          Privacy Policy
        </a>
        .
      </p>
    </main>
  );
};

const ResendEmail = () => {
  const location = useLocation();
  const getMagicLinkMutation = useGetMagicLink();

  const [countdown, setCountdown] = useState(30);
  const [isDisabled, setIsDisabled] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      setIsDisabled(false);
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [countdown]);

  const resendEmail = async (payload: RequestMagicLinkPayload) => {
    await getMagicLinkMutation.mutateAsync(payload, {
      onSuccess: (data) => {
        setEmail(payload.email);

        localStorage.setItem("magic-code", (data as any).debug.code);

        setIsDisabled(true); // disable button again
        setEmailSent(true);

        setTimeout(() => {
          setEmailSent(false);
          setCountdown(30); // reset countdown on resend
        }, 2000);
      },
    });
  };

  return (
    <div class="flex flex-col gap-2 self-center text-center text-grey-400 text-sm">
      {emailSent ? (
        <p>Magic Code Resent</p>
      ) : (
        <p>
          Didn't get the link? Click resend in {countdown}s.{" "}
          <button
            type="button"
            onClick={() => {
              if (emailSignal.value) resendEmail({ email: emailSignal.value });
            }}
            disabled={isDisabled}
            className={`text-black underline ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Resend
          </button>
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          clearEmail();
          location.route("/sign-in");
        }}
        class="flex justify-center gap-1"
      >
        Wrong Email?
        <span class="text-black underline">Change Email</span>
      </button>
    </div>
  );
};
interface InputOTPGroupProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

export const InputOTPGroup = ({ value, onChange, onComplete }: InputOTPGroupProps) => {
  const length = 6;
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Convert string value to array and update local state
  useEffect(() => {
    const valueArray = value.split("").slice(0, length);
    const newOtp = [...Array(length).fill("")];
    valueArray.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
  }, [value, length]);

  // Check if OTP is complete and call onComplete
  useEffect(() => {
    const otpString = otp.join("");
    onChange(otpString);

    if (otpString.length === length && /^\d{6}$/.test(otpString) && onComplete) {
      onComplete();
    }
  }, [otp, length, onChange, onComplete]);

  // Handler when a user types a digit
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if valid entry
    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  // Handler for pasting into any input
  const handlePaste = (event: JSX.TargetedClipboardEvent<HTMLInputElement>, index: number) => {
    const pasteValue = event.clipboardData?.getData("text").replace(/\D/g, "") || "";
    if (!pasteValue) return event.preventDefault();

    const pasteArray = pasteValue.split("").slice(0, length - index);
    const newOtp = [...otp];
    pasteArray.forEach((char: string, i: number) => {
      if (index + i < length) {
        newOtp[index + i] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled or next input
    const nextIndex = Math.min(index + pasteArray.length, length - 1);
    setTimeout(() => inputs.current[nextIndex]?.focus(), 0);
    event.preventDefault();
  };

  // Handler for delete/backspace
  const handleKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // Handler for focus to select all text
  const handleFocus = (event: JSX.TargetedFocusEvent<HTMLInputElement>) => {
    (event.target as HTMLInputElement).select();
  };

  return (
    <>
      {otp.map((value, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange((e.target as HTMLInputElement).value, i)}
          onPaste={(e) => handlePaste(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={handleFocus}
          class="h-10 w-full flex-1 border border-line-700 text-center text-sm placeholder:text-grey-400"
        />
      ))}
    </>
  );
};
