import {
  CalendarIcon,
  QueueListIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "~/root";
import { isRouteErrorResponse, Outlet, useMatches, useRouteError } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  return null;
};

const secondaryNavigation = [
  { name: "Your Profile", href: "/bets/", icon: UserCircleIcon },
  {
    name: "This Week's Bets",
    href: "/bets/week",
    icon: CalendarIcon,
  },
  { name: "Season Standings", href: "/bets/standings", icon: QueueListIcon },
];

/**
 * Parent route for all bet-related routes. Includes an error boundary.
 */
export default function Bets() {
  const matches = useMatches();
  const location = matches[matches.length - 1].pathname;

  return (
    <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
      <aside className="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
        <nav className="flex-none px-4 sm:px-6 lg:px-0">
          <ul className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
            {secondaryNavigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={classNames(
                    location === item.href
                      ? "bg-gray-50 text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                    "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold",
                  )}
                >
                  <item.icon
                    className={classNames(
                      location === item.href
                        ? "text-indigo-600"
                        : "text-gray-400 group-hover:text-indigo-600",
                      "h-6 w-6 shrink-0",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <ErrorComponent errorText={error.message} />;
  }

  if (!isRouteErrorResponse(error)) {
    return <ErrorComponent errorText="Unknown Error" />;
  }

  if (error.status === 404) {
    return <ErrorComponent errorText="Page not found" />;
  }

  return (
    <ErrorComponent
      errorText={`An unexpected error occurred: ${error.statusText}`}
    />
  );
}

const ErrorComponent = ({ errorText }) => {
  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Error
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          We encountered an error while loading this page. Please try again.
        </p>
        <p className="mt-6 text-xs leading-7 text-gray-600">{errorText}</p>
      </div>
    </div>
  );
};
