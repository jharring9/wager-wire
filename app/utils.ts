import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";
const NFL_SEASON_START = new Date("2023-09-05");

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function getNFLWeek(today: Date = new Date()) {
  const daysSinceStart =
    (today.valueOf() - NFL_SEASON_START.valueOf()) / 1000 / 60 / 60 / 24;
  return Math.floor(daysSinceStart / 7) + 1;
}

export function getWeekDays(nflWeek: string): string {
  const weekStartDate = new Date(NFL_SEASON_START.getTime());
  weekStartDate.setDate(
    NFL_SEASON_START.getDate() + (parseInt(nflWeek) - 1) * 7 + 1,
  );

  const weekEndDate = new Date(weekStartDate.getTime());
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
  return `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`;
}
