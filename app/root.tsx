import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import React, { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";
import { useOptionalUser } from "~/utils";
import { UserIcon } from "@heroicons/react/24/solid";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  // NOTE: Architect deploys the public directory to /_static/
  { rel: "icon", href: "/_static/favicon.ico" },
];

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const loader = async ({ request }: LoaderArgs) => {
  return json({ user: await getUser(request) });
};

const navigation = [
  { name: "Home", href: "/", current: false },
  { name: "Wager", href: "wager", current: false },
  { name: "Standings", href: "/bets/standings", current: false },
];

export default function App() {
  const user = useOptionalUser();
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="min-h-full">
          <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-8 w-8"
                          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                          alt="Your Company"
                        />
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                          {navigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={classNames(
                                item.current
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                "rounded-md px-3 py-2 text-sm font-medium",
                              )}
                              aria-current={item.current ? "page" : undefined}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      {user ? (
                        <div className="ml-4 flex items-center md:ml-6">
                          {/* Profile dropdown */}
                          <Menu as="div" className="relative ml-3">
                            <div>
                              <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">Open user menu</span>
                                <UserIcon className="h-6 w-6 text-gray-400" />
                              </Menu.Button>
                            </div>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Menu.Item key="profile">
                                  {({ active }) => (
                                    <Link
                                      to="/bets"
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700",
                                      )}
                                    >
                                      Your Profile
                                    </Link>
                                  )}
                                </Menu.Item>
                                <Menu.Item key="logout">
                                  {({ active }) => (
                                    <Form
                                      action="/logout"
                                      method="post"
                                      className="w-full"
                                    >
                                      <button
                                        type="submit"
                                        className={classNames(
                                          active ? "bg-gray-100" : "",
                                          "text-left px-4 py-2 text-sm text-gray-700 w-full",
                                        )}
                                      >
                                        Logout
                                      </button>
                                    </Form>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      ) : (
                        <Link
                          to="/login"
                          className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium bg-gray-900 text-white"
                        >
                          Login
                        </Link>
                      )}
                    </div>
                    <div className="-mr-2 flex md:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="md:hidden">
                  <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "block rounded-md px-3 py-2 text-base font-medium",
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                  {user && (
                    <div className="border-t border-gray-700 pb-3 pt-4">
                      <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium leading-none text-white">
                            {user.name}
                          </div>
                          <div className="text-sm font-medium leading-none text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 px-2">
                        <Link
                          to="/bets"
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                        >
                          Your Bets
                        </Link>
                        <Form action="/logout" method="post" className="w-full">
                          <button
                            type="submit"
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            Logout
                          </button>
                        </Form>
                      </div>
                    </div>
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
