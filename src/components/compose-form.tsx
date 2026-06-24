// app/dashboard/[orgId]/compose/compose-form.tsx
"use client";

import { createPostSchema, type CreatePostInput } from "@/lib/schemas/post";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export function ComposeForm({ organizationId }: { organizationId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery(
    trpc.socialAccounts.list.queryOptions({ organizationId }),
  );

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      organizationId,
      content: "",
      mediaUrls: [],
      socialAccountIds: [],
    },
  });

  const createPost = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.posts.list.queryKey({ organizationId }),
        });
        form.reset({
          organizationId,
          content: "",
          mediaUrls: [],
          socialAccountIds: [],
        });
      },
      onError: (error) => {
        form.setError("root", { message: error.message });
      },
    }),
  );

  function onSubmit(values: CreatePostInput) {
    createPost.mutate(values);
  }

  return (
    <form id="compose-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* Content */}
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="compose-content">Post content</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  id="compose-content"
                  placeholder="What do you want to post?"
                  rows={5}
                  className="min-h-32 resize-none"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {field.value.length}/5000 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Platform selection — checkbox array */}
        <Controller
          name="socialAccountIds"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet>
              <FieldLegend variant="label">Publish to</FieldLegend>
              <FieldDescription>
                Choose which connected accounts receive this post.
              </FieldDescription>
              <FieldGroup data-slot="checkbox-group">
                {accounts?.map((account) => (
                  <Field
                    key={account.id}
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id={`compose-account-${account.id}`}
                      name={field.name}
                      aria-invalid={fieldState.invalid}
                      checked={field.value.includes(account.id)}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...field.value, account.id]
                          : field.value.filter((id) => id !== account.id);
                        field.onChange(next);
                      }}
                    />
                    <FieldLabel
                      htmlFor={`compose-account-${account.id}`}
                      className="font-normal"
                    >
                      {account.name}{" "}
                      <span className="text-muted-foreground">
                        ({account.platform})
                      </span>
                      {account.status === "NEEDS_RECONNECTION" && (
                        <span className="text-destructive ml-1">
                          — needs reconnection
                        </span>
                      )}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />

        {/* Scheduled date/time */}
        <Controller
          name="scheduledAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="compose-scheduled-at">
                Schedule for
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="compose-scheduled-at"
                    type="button"
                    variant="outline"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(field.value, "PPP p")
                      : "Pick a date and time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (!date) return;
                      const existing = field.value ?? new Date();
                      date.setHours(existing.getHours(), existing.getMinutes());
                      field.onChange(date);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                  <div className="p-3 border-t">
                    <input
                      type="time"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value
                          .split(":")
                          .map(Number);
                        const next = new Date(field.value ?? new Date());
                        next.setHours(hours, minutes);
                        field.onChange(next);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}

        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button
            type="submit"
            form="compose-form"
            disabled={createPost.isPending}
          >
            {createPost.isPending ? "Scheduling..." : "Schedule Post"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
