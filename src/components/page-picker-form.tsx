// app/dashboard/[orgId]/social-accounts/page-picker-form.tsx
"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectPagesSchema, type ConnectPagesInput } from "@/lib/schemas/social-account";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { useRouter } from "next/navigation";

interface AvailablePage {
  id: string;
  name: string;
  access_token: string;
  instagramAccountId?: string;
}

export function PagePickerForm({
  organizationId,
  pages,
}: {
  organizationId: string;
  pages: AvailablePage[];
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<ConnectPagesInput>({
    resolver: zodResolver(connectPagesSchema),
    defaultValues: {
      organizationId,
      selections: pages.map((p) => ({
        pageId: p.id,
        pageName: p.name,
        pageToken: p.access_token,
        instagramAccountId: p.instagramAccountId,
        selected: false,
      })),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "selections" });

  const connectPages = useMutation(
    trpc.socialAccounts.connectPages.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.socialAccounts.list.queryKey({ organizationId }),
        });
        router.push(`/dashboard/${organizationId}/social-accounts`);
      },
      onError: (error) => form.setError("root", { message: error.message }),
    })
  );

  function onSubmit(values: ConnectPagesInput) {
    connectPages.mutate({
      organizationId: values.organizationId,
      selections: values.selections.filter((s) => s.selected),
    });
  }

  const selectionsError = form.formState.errors.selections;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet className="gap-4">
        <FieldLegend variant="label">Available pages</FieldLegend>
        <FieldDescription>
          Pick the Facebook Pages (and linked Instagram accounts) to connect.
        </FieldDescription>

        <FieldGroup className="gap-3" data-slot="checkbox-group">
          {fields.map((item, index) => (
            <Controller
              key={item.id}
              name={`selections.${index}.selected`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Card>
                  <CardContent className="pt-4">
                    <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                      <Checkbox
                        id={`page-${item.id}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor={`page-${item.id}`} className="font-normal">
                        <span className="font-medium">{item.pageName}</span>
                        {item.instagramAccountId && (
                          <FieldDescription>
                            Instagram account connected — will be added too.
                          </FieldDescription>
                        )}
                      </FieldLabel>
                    </Field>
                  </CardContent>
                </Card>
              )}
            />
          ))}
        </FieldGroup>

        {selectionsError?.root && <FieldError errors={[selectionsError.root]} />}
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}

        <Field orientation="horizontal">
          <Button type="submit" disabled={connectPages.isPending}>
            {connectPages.isPending ? "Connecting..." : "Connect selected pages"}
          </Button>
        </Field>
      </FieldSet>
    </form>
  );
}