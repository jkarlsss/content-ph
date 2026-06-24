// app/onboarding/create-organization/create-org-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export function CreateOrgForm() {
  const trpc = useTRPC();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const createOrg = useMutation(
    trpc.organizations.create.mutationOptions({
      onSuccess: (org) => router.push(`/dashboard/${org.id}`),
      onError: (error) => form.setError("root", { message: error.message }),
    }),
  );

  return (
    <form onSubmit={form.handleSubmit((values) => createOrg.mutate(values))}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="org-name">Organization name</FieldLabel>
              <Input
                {...field}
                id="org-name"
                placeholder="Acme Inc."
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
        <Button type="submit" disabled={createOrg.isPending}>
          {createOrg.isPending ? "Creating..." : "Create organization"}
        </Button>
      </FieldGroup>
    </form>
  );
}
