"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "./fields";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} noValidate className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Field id="email" label="E-mail" error={state.fieldErrors?.email}>
        <TextInput
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          required
          invalid={!!state.fieldErrors?.email}
        />
      </Field>
      <Field id="password" label="Senha" error={state.fieldErrors?.password}>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={!!state.fieldErrors?.password}
        />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-[var(--radius-md)] border border-danger/20 bg-danger/5 px-3.5 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="admin" size="lg" className="w-full" loading={pending}>
        Entrar
      </Button>
    </form>
  );
}
