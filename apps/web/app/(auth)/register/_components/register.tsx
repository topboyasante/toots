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
import { registerFormSchema, type RegisterFormValues } from "@/lib/schema/auth";
import { type Resolver, Controller, useForm } from "react-hook-form";
import { authClient } from "@/lib/auth/client";
import { Logo } from "./logos";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(
      registerFormSchema as unknown as Parameters<typeof zodResolver>[0],
    ) as unknown as Resolver<RegisterFormValues>,
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: RegisterFormValues) {
    const { error } = await authClient.signUp.email({
      email: data.email,
      name: data.username,
      password: data.password,
    }, {
      onRequest: () => {
        toast.loading("Signing up...");
      },
      onSuccess: () => {
        toast.success("Signed up successfully");
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
              Acme
            </p>
          </div>
          <h3 className="text-balance mt-6 text-lg font-semibold text-foreground dark:text-foreground">
            Create your account
          </h3>
          <p className="text-pretty mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
            >
              Sign in
            </Link>
          </p>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
            noValidate
          >
            <Controller<RegisterFormValues>
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    aria-invalid={fieldState.invalid}
                    autoComplete="username"
                    placeholder="johndoe"
                    className="mt-2"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller<RegisterFormValues>
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
            <Controller<RegisterFormValues>
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
                      autoComplete="new-password"
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
                  <span
                    className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                  />
                  Creating account…
                </span>
              ) : (
                "Create account"
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
