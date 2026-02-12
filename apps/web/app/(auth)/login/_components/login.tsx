"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/lib/schema/auth";
import { type Resolver, Controller, useForm } from "react-hook-form";
import { authClient } from "@/lib/auth/client";
import { Logo } from "./logos";
import { Spinner } from "@workspace/ui/components/spinner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(
      loginFormSchema as unknown as Parameters<typeof zodResolver>[0],
    ) as unknown as Resolver<LoginFormValues>,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: LoginFormValues) {
    await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/",
    }, {
      onSuccess: () => {
        router.push("/");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message);
      },
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center space-x-1.5">
            <Logo
              className="h-7 w-7 text-foreground dark:text-foreground"
              aria-hidden={true}
            />
            <p className="text-pretty text-lg font-medium text-foreground dark:text-foreground">
              Toots
            </p>
          </div>
          <h3 className="text-balance mt-6 text-lg font-semibold tracking-tight text-foreground dark:text-foreground">
            Sign in to your account
          </h3>
          <p className="text-pretty mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
            >
              Sign up
            </Link>
          </p>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
            noValidate
          >
            <Controller<LoginFormValues>
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    placeholder="ephraim@blocks.so"
                    className="mt-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller<LoginFormValues>
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative mt-2">
                    <Input
                      {...field}
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      placeholder="********"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              type="submit"
              className="mt-4 w-full py-2 font-medium"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="size-4 shrink-0" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <p className="text-pretty mt-6 text-sm text-muted-foreground dark:text-muted-foreground">
            Forgot your password?{" "}
            <Link
              href="#"
              className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
            >
              Reset password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
