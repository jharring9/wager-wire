import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "~/shared";
import { requireUser } from "~/session.server";
import type { LoaderArgs } from "@remix-run/node";
import {
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  Bars3Icon,
  CalendarIcon,
  HomeIcon,
  PlusIcon,
  QueueListIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import {
  Form,
  isRouteErrorResponse,
  Link,
  Outlet,
  useMatches,
  useRouteError,
} from "@remix-run/react";

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Place Wager", href: "/app/wager", icon: PlusIcon },
  { name: "Your Bets", href: "/app/", icon: BanknotesIcon },
  {
    name: "This Week's Bets",
    href: "/app/week",
    icon: CalendarIcon,
  },
  { name: "Season Standings", href: "/app/standings", icon: QueueListIcon },
];

// const leagues = [
//   { id: 1, name: "League 1", href: "#", initial: "L", current: false },
//   { id: 2, name: "Test League", href: "#", initial: "T", current: false },
// ];

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  return null;
};

/**
 * Parent route for all bet-related routes. Includes an error boundary.
 */
export default function Dashboard() {
  const matches = useMatches();
  const location = matches[matches.length - 1].pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 xl:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>

                  {/* Sidebar component */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="WagerWire"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    location === item.href
                                      ? "bg-gray-800 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                  )}
                                >
                                  <item.icon
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Form action="/logout" method="POST">
                                <button className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-400 hover:text-white hover:bg-gray-800">
                                  <ArrowRightOnRectangleIcon
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                  Logout
                                </button>
                              </Form>
                            </li>
                          </ul>
                        </li>
                        {/*<li>*/}
                        {/*  <div className="text-xs font-semibold leading-6 text-gray-400">*/}
                        {/*    Your leagues*/}
                        {/*  </div>*/}
                        {/*  <ul className="-mx-2 mt-2 space-y-1">*/}
                        {/*    {leagues.map((team) => (*/}
                        {/*      <li key={team.name}>*/}
                        {/*        <Link*/}
                        {/*          to={team.href}*/}
                        {/*          className={classNames(*/}
                        {/*            team.current*/}
                        {/*              ? "bg-gray-800 text-white"*/}
                        {/*              : "text-gray-400 hover:text-white hover:bg-gray-800",*/}
                        {/*            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",*/}
                        {/*          )}*/}
                        {/*        >*/}
                        {/*          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">*/}
                        {/*            {team.initial}*/}
                        {/*          </span>*/}
                        {/*          <span className="truncate">{team.name}</span>*/}
                        {/*        </Link>*/}
                        {/*      </li>*/}
                        {/*    ))}*/}
                        {/*  </ul>*/}
                        {/*</li>*/}
                        <li className="-mx-6 mt-auto">
                          <Link
                            to="/app/profile"
                            className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                          >
                            <UserCircleIcon className="h-8 w-8" />
                            <span aria-hidden="true">Your Profile</span>
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
          {/* Sidebar component, swap this element with another sidebar if needed */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                alt="WagerWire"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            location === item.href
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-800",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                          )}
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Form action="/logout" method="POST" className="w-full">
                        <button className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-400 hover:text-white hover:bg-gray-800 w-full">
                          <ArrowRightOnRectangleIcon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          Logout
                        </button>
                      </Form>
                    </li>
                  </ul>
                </li>
                {/*<li>*/}
                {/*  <div className="text-xs font-semibold leading-6 text-gray-400">*/}
                {/*    Your leagues*/}
                {/*  </div>*/}
                {/*  <ul className="-mx-2 mt-2 space-y-1">*/}
                {/*    {leagues.map((team) => (*/}
                {/*      <li key={team.name}>*/}
                {/*        <Link*/}
                {/*          to={team.href}*/}
                {/*          className={classNames(*/}
                {/*            team.current*/}
                {/*              ? "bg-gray-800 text-white"*/}
                {/*              : "text-gray-400 hover:text-white hover:bg-gray-800",*/}
                {/*            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",*/}
                {/*          )}*/}
                {/*        >*/}
                {/*          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">*/}
                {/*            {team.initial}*/}
                {/*          </span>*/}
                {/*          <span className="truncate">{team.name}</span>*/}
                {/*        </Link>*/}
                {/*      </li>*/}
                {/*    ))}*/}
                {/*  </ul>*/}
                {/*</li>*/}
                <li className="-mx-6 mt-auto">
                  <Link
                    to="/app/profile"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                  >
                    <UserCircleIcon className="h-8 w-8" />
                    <span aria-hidden="true">Your Profile</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="xl:pl-72">
          {/* Sticky mobile header */}
          <div className="xl:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-white xl:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </>
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
