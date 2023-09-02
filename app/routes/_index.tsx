import type { V2_MetaFunction, ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Game } from "~/models/game.server";
import { getCurrentGames } from "~/models/game.server";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  Bars3Icon,
  CheckIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { requireUserId } from "~/session.server";
import { createBet } from "~/models/bet.server";
import { getNFLWeek, useOptionalUser } from "~/utils";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const navigation = [
  { name: "Dashboard", href: "/", current: true },
  { name: "Your Bets", href: "bets", current: false },
  { name: "Standings", href: "standings", current: false },
];

// TODO -- info alert if bet has already been placed this week
// TODO -- OR, display yellow alert if week is locked, don't allow submission

export const meta: V2_MetaFunction = () => [{ title: "Wager Wire" }];

export const loader = async () => {
  const currentGames = await getCurrentGames();
  return json(currentGames);
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const gameId = formData.get("gameId");
  const teamId = formData.get("teamId");

  if (typeof gameId !== "string" || gameId.length === 0) {
    return json(
      { errors: { body: null, title: "Game ID is required" } },
      { status: 400 },
    );
  }

  if (teamId !== "1" && teamId !== "2") {
    return json(
      { errors: { body: "Team selection is required", title: null } },
      { status: 400 },
    );
  }

  const bet = await createBet({
    gameId: gameId,
    selectedTeam: teamId,
    userId: userId,
    week: getNFLWeek().toString(),
  });

  return redirect(`/bets/${bet.gameId}`);
};

export default function Index() {
  const [searchParams] = useSearchParams();
  const alertText = searchParams.get("alert");
  const user = useOptionalUser();
  const data = useLoaderData<typeof loader>();

  return (
    <div className="min-h-full">
      <div className="bg-gray-800 pb-32">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="border-b border-gray-700">
                  <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-8 w-8"
                          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                          alt="Wager Wire"
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
                      <div className="ml-4 flex items-center md:ml-6">
                        {user ? (
                          <Menu as="div" className="relative ml-3">
                            <div>
                              <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400 hover:text-white">
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">Open user menu</span>
                                <UserCircleIcon className="h-8 w-8" />
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
                                      Your Bets
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
                        ) : (
                          <div className="relative ml-3">
                            <Link
                              to="/login"
                              className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                            >
                              Login
                            </Link>
                          </div>
                        )}

                        {/* Profile dropdown */}
                      </div>
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
              </div>

              <Disclosure.Panel className="border-b border-gray-700 md:hidden">
                <div className="space-y-1 px-2 py-3 sm:px-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block rounded-md px-3 py-2 text-base font-medium",
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {user?.name}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
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
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <div className="py-16"></div>
      </div>
      <main className="-mt-64">
        <Alert text={alertText} />
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              This Week's Bets
            </h1>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Page-specific content below */}
          <ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg sm:rounded-xl">
            {data.map((game) => (
              <GameSelectModal game={game} key={game.id} />
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

const Alert = ({ text }) => {
  const [show, setShow] = useState(true);

  return (
    <div
      className={classNames(
        show && text
          ? "rounded-md bg-green-50 p-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          : "hidden",
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">{text}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setShow(false)}
              className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameSelectModal: React.FC<{ game: Game }> = ({ game }) => {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState(0);
  const cancelButtonRef = useRef(null);

  const closeModal = () => {
    setOpen(false);
    setTeam(0);
  };

  return (
    <>
      <li
        key={game.id}
        className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 cursor-pointer hover:bg-gray-200"
        onClick={() => setOpen(true)}
      >
        <div className="flex min-w-0 gap-x-4">
          <img
            className="h-12 w-12 flex-none"
            src={game.team1Url}
            alt={game.team1}
          />
          <img
            className="h-12 w-12 flex-none"
            src={game.team2Url}
            alt={game.team2}
          />
          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900">
              {game.team1} vs. {game.team2}
            </p>
            <p className="mt-1 flex text-xs leading-5 text-gray-500">
              {game.team1Spread > 0
                ? `${game.team2} ${game.team2Spread}`
                : `${game.team1} ${game.team1Spread}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-x-4">
          <div className="hidden sm:flex sm:flex-col sm:items-end">
            <div className="mt-1 flex items-center gap-x-1.5">
              <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs leading-5 text-gray-500">{game.date}</p>
            </div>
          </div>
          <ChevronRightIcon
            className="h-5 w-5 flex-none text-gray-400"
            aria-hidden="true"
          />
        </div>
      </li>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={closeModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Make Your Pick
                      </Dialog.Title>

                      {/* Matchup data */}
                      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                        <li
                          key="team1"
                          className={classNames(
                            team === 1
                              ? "bg-gray-300"
                              : "bg-white hover:bg-gray-100",
                            "col-span-1 divide-y divide-gray-200 rounded-lg cursor-pointer shadow",
                          )}
                          onClick={() => setTeam(1)}
                        >
                          <div className="flex w-full justify-between space-x-6 p-6">
                            <div className="flex-1 truncate">
                              <div className="flex space-x-3">
                                <h3 className="truncate text-sm font-medium text-gray-900">
                                  {game.team1}
                                </h3>
                                <span
                                  className={classNames(
                                    game.team1Spread < game.team2Spread
                                      ? "bg-green-50 text-green-700 ring-red-600/20"
                                      : "bg-red-50 text-red-700 ring-red-600/20",
                                    "inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                  )}
                                >
                                  {game.team1Spread > 0 && "+"}
                                  {game.team1Spread}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-gray-500 text-left">
                                More team data
                              </p>
                            </div>
                            <img
                              className="h-12 w-12 flex-shrink-0"
                              src={game.team1Url}
                              alt={game.team1}
                            />
                          </div>
                        </li>
                        <li
                          key="team2"
                          className={classNames(
                            team === 2
                              ? "bg-gray-300"
                              : "bg-white hover:bg-gray-100",
                            "col-span-1 divide-y divide-gray-200 rounded-lg cursor-pointer shadow",
                          )}
                          onClick={() => setTeam(2)}
                        >
                          <div className="flex w-full justify-between space-x-6 p-6">
                            <div className="flex-1 truncate">
                              <div className="flex space-x-3">
                                <h3 className="truncate text-sm font-medium text-gray-900">
                                  {game.team2}
                                </h3>
                                <span
                                  className={classNames(
                                    game.team2Spread < game.team1Spread
                                      ? "bg-green-50 text-green-700 ring-red-600/20"
                                      : "bg-red-50 text-red-700 ring-red-600/20",
                                    "inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                  )}
                                >
                                  {game.team2Spread > 0 && "+"}
                                  {game.team2Spread}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-gray-500 text-left">
                                More team data
                              </p>
                            </div>
                            <img
                              className="h-12 w-12 flex-shrink-0"
                              src={game.team2Url}
                              alt={game.team2}
                            />
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Form className="mt-5 sm:mt-6" method="post">
                    <input type="hidden" name="gameId" value={game.id} />
                    <input type="hidden" name="teamId" value={team} />
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Submit
                    </button>
                  </Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
