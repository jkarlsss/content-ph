import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a string to title case (first letter uppercase, rest lowercase).
 * Useful for displaying SCREAMING_CASE enum values as readable labels.
 */
export function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Maps an array of string values (e.g. from Object.values(SomeEnum))
 * into { label, value , lowercase} pairs, with label in title case.
 */
export function toLabelValuePairs<T extends string>(
  values: T[]
): { label: string; value: T, lowercase: string }[] {
  return values.map((value) => ({
    label: toTitleCase(value),
    value,
    lowercase: value.toLowerCase(),
  }));
}