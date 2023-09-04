import type { V2_MetaFunction, ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Game } from "~/models/game.server";
import { getCurrentGames } from "~/models/game.server";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { requireUserId } from "~/session.server";
import { createBet, getUserBetByWeek } from "~/models/bet.server";
import { getNFLWeek } from "~/utils";

// TODO -- OR, display popup if week is locked, don't allow submission
// TODO -- if bet has been placed this week, warn on submit

export const meta: V2_MetaFunction = () => [{ title: "Wager Wire" }];

export const loader = async ({ request }: LoaderArgs) => {
  const currentGames = await getCurrentGames();
  const userId = await requireUserId(request);

  const currentBet = await getUserBetByWeek({
    userId: userId,
    week: getNFLWeek().toString(),
  });

  const dayOfWeek = new Date().getDay();
  const bettingOpen = dayOfWeek >= 2 && dayOfWeek <= 4;

  return json({ currentGames, currentBet, bettingOpen });
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
  const { currentGames, currentBet, bettingOpen } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const alertText = searchParams.get("alert");

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Alert text={alertText} />
        {!bettingOpen && (
          <Alert
            warn
            text="Betting is closed for the week. You may not place any bets at this point."
          />
        )}
        {bettingOpen && currentBet && (
          <Alert
            warn
            text="You have already placed your bet this week. Making another submission will override your current bet."
          />
        )}

        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Page-specific content below */}
          <ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg sm:rounded-xl">
            {currentGames.map((game) => (
              <GameSelectModal game={game} key={game.id} />
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

const Alert = ({ text, warn = false }) => {
  const [show, setShow] = useState(true);

  return (
    <div
      className={classNames(
        show && text
          ? "rounded-md p-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4"
          : "hidden",
        warn ? "bg-yellow-50" : "bg-green-50",
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {warn ? (
            <ExclamationTriangleIcon
              className="text-yellow-400 h-5 w-5"
              aria-hidden="true"
            />
          ) : (
            <CheckCircleIcon
              className="text-green-400 h-5 w-5"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="ml-3">
          <p
            className={classNames(
              warn ? "text-yellow-800" : "text-green-800",
              "text-sm font-medium",
            )}
          >
            {text}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setShow(false)}
              className={classNames(
                warn
                  ? "bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50"
                  : "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50",
                "inline-flex rounded-md  p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
              )}
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
                    <div className="mx-auto flex h-12 w-12 items-center justify-center">
                      <LockClosedIcon
                        className="h-10 w-10 text-gray-700"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="text-center">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-bold leading-6 text-gray-900"
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
                                      ? "bg-green-50 text-green-700 ring-green-600/20"
                                      : "bg-red-50 text-red-700 ring-red-600/20",
                                    "inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                  )}
                                >
                                  {game.team1Spread > 0 && "+"}
                                  {game.team1Spread}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-gray-500 text-left">
                                More team data coming...
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
                                      ? "bg-green-50 text-green-700 ring-green-600/20"
                                      : "bg-red-50 text-red-700 ring-red-600/20",
                                    "inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                  )}
                                >
                                  {game.team2Spread > 0 && "+"}
                                  {game.team2Spread}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-gray-500 text-left">
                                More team data coming...
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
