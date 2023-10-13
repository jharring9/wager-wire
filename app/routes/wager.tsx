import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Game } from "~/models/game.server";
import { getCurrentGames } from "~/models/game.server";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Popover, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { requireUserId } from "~/session.server";
import { getBet } from "~/models/bet.server";
import { getNFLWeek } from "~/utils";
import { classNames } from "~/root";

export const meta: V2_MetaFunction = () => [
  { title: "WagerWire - Place Wager" },
];

type SlipEntry = {
  gameId: string;
  teamId: string;
  name: string;
  spread: number;
  imageSrc: string;
  units: number;
};

export const loader = async ({ request }: LoaderArgs) => {
  const currentGames = await getCurrentGames();
  const userId = await requireUserId(request);

  const currentBet = await getBet({
    userId: userId,
    week: getNFLWeek().toString(),
  });

  const dayOfWeek = new Date().getDay();
  const bettingOpen = dayOfWeek >= 2 && dayOfWeek <= 4;

  return json({ currentGames, currentBet, bettingOpen });
};

/**
 * Main page for placing a wager. Displays all games for the current week and
 * allows the user to select one or more teams to bet on.
 */
export default function PlaceWager() {
  const [slip, setSlip] = useState<SlipEntry[]>([]);
  const { currentGames, currentBet, bettingOpen } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const alertText = searchParams.get("alert");
  const [errorText, setErrorText] = useState<string | null>(null);

  const addGameToSlip = (game) => {
    if (slip.some((existingGame) => existingGame.gameId === game.gameId)) {
      setErrorText("You have already added this game to your betslip.");
    } else setSlip([...slip, game]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeBet = (index: number) => {
    const newSlip = [...slip];
    newSlip.splice(index, 1);
    setSlip(newSlip);
  };

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Week {getNFLWeek()} Games
            </h1>
            <div className="mt-3 sm:ml-4 sm:mt-0">
              {slip && slip.length > 0 && bettingOpen && (
                <Cart cart={slip} removeBet={removeBet} />
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Alert text={alertText} />
        <Alert warn text={errorText} />
        {!bettingOpen && (
          <Alert
            warn
            text="Betting is closed for the week. You may not place any bets at this point."
          />
        )}
        {bettingOpen && currentBet && (
          <Alert
            warn
            text="You have already submitted your slate this week. Making another submission will override your current slate."
          />
        )}

        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Page-specific content below */}
          <ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg sm:rounded-xl">
            {currentGames.map((game) => (
              <GameSelectModal
                game={game}
                key={game.id}
                allowed={true}
                addGameToSlip={addGameToSlip}
              />
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export const Alert = ({ text, warn = false }) => {
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

const GameSelectModal: React.FC<{
  game: Game;
  allowed: boolean;
  addGameToSlip: Function;
}> = ({ game, allowed, addGameToSlip }) => {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState(0);
  const cancelButtonRef = useRef(null);

  const closeModal = () => {
    setOpen(false);
    setTeam(0);
  };

  const openModal = () => {
    if (allowed) setOpen(true);
  };

  const submitForm = () => {
    closeModal();
    if (team === 0) return;
    addGameToSlip({
      gameId: game.id,
      teamId: team,
      name: team === 1 ? game.team1 : game.team2,
      spread: team === 1 ? game.team1Spread : game.team2Spread,
      imageSrc: team === 1 ? game.team1Url : game.team2Url,
      units: 0,
    });
  };

  return (
    <>
      <li
        key={game.id}
        className={classNames(
          allowed ? "hover:bg-gray-50 hover:bg-gray-200 cursor-pointer" : "",
          "flex justify-between gap-x-6 px-4 py-5 sm:px-6",
        )}
        onClick={openModal}
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
                  <button
                    onClick={submitForm}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 mt-4 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Add to Bet Slip
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

const Cart = ({ cart, removeBet }) => {
  return (
    <Popover className="z-20 ml-4 flow-root text-sm lg:relative lg:ml-8">
      <Popover.Button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        View Betslip
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Popover.Panel className="absolute inset-x-0 top-16 mt-px bg-white pb-6 shadow-lg sm:px-2 lg:left-auto lg:right-0 lg:top-full lg:-mr-1.5 lg:mt-3 lg:w-80 lg:rounded-lg lg:ring-1 lg:ring-black lg:ring-opacity-5">
          <Form
            method="POST"
            action="/betslip"
            className="mx-auto max-w-2xl px-4"
          >
            <ul className="divide-y divide-gray-200">
              {cart.map((team, index) => (
                <li key={index} className="flex items-center py-6">
                  <img
                    src={team.imageSrc}
                    className="h-16 w-16 flex-none"
                    alt="team logo"
                  />
                  <div className="ml-4 flex-auto">
                    <h3 className="font-medium text-gray-900">
                      {team.name} {team.spread > 0 && "+"}
                      {team.spread}
                    </h3>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        className="inline-flex rounded-md  p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:ring-gray-600 focus:ring-offset-gray-50"
                        onClick={() => removeBet(index)}
                      >
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <input type="hidden" name="cart" value={JSON.stringify(cart)} />
            <button
              type="submit"
              name="_action"
              value="accept"
              className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Continue to Unit Placement
            </button>
          </Form>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
