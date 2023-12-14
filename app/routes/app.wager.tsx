import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getCurrentGames } from "~/models/game.server";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { Fragment, useState } from "react";
import { Dialog, Popover, RadioGroup, Transition } from "@headlessui/react";
import { ChevronRightIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { requireUserId } from "~/session.server";
import { getBet } from "~/models/bet.server";
import { getNFLWeek } from "~/utils";
import {
  classNames,
  Notification,
  formatGameDate,
  checkGameStarted,
} from "~/shared";

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

  return json({ currentGames, currentBet });
};

/**
 * Main page for placing a wager. Displays all games for the current week and
 * allows the user to select one or more teams to bet on.
 */
export default function PlaceWager() {
  const [slip, setSlip] = useState<SlipEntry[]>([]);
  const { currentGames, currentBet } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const alertText = searchParams.get("alert");
  const [errorText, setErrorText] = useState<string | null>(null);

  const addGameToSlip = (game) => {
    if (slip.some((existingGame) => existingGame.gameId === game.gameId)) {
      setErrorText("You have already added this game to your betslip.");
    } else {
      setErrorText(null);
      setSlip([...slip, game]);
    }
  };

  const removeBet = (index: number) => {
    const newSlip = [...slip];
    newSlip.splice(index, 1);
    setSlip(newSlip);
  };

  return (
    <>
      {slip && slip.length === 0 && (
        <Notification
          text={
            alertText ||
            errorText ||
            (currentBet &&
              "You have already submitted your slate this week. Making another submission will override your current slate.")
          }
          error={!!errorText || !!currentBet}
        />
      )}
      <main>
        <header className="z-10 flex sticky top-0 bg-gray-900 items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-base font-semibold leading-7 text-white">
            Week {getNFLWeek()} Games
          </h1>

          {slip && slip.length > 0 && true && (
            <Cart cart={slip} removeBet={removeBet} />
          )}
        </header>

        {/* Games list */}
        <ul className="divide-y divide-white/5">
          {currentGames.map((game, index) => (
            <GameSelectionModal
              key={index}
              game={game}
              allowed={true}
              addGameToSlip={addGameToSlip}
            />
          ))}
        </ul>
      </main>
    </>
  );
}

const GameSelectionModal = ({ game, allowed, addGameToSlip }) => {
  const isFantasy =
    game.id && typeof game.id === "string" && game.id.includes("fantasy");

  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState(0);

  const closeModal = () => {
    setOpen(false);
    setTeam(0);
  };

  const openModal = () => {
    if (allowed) setOpen(true);
  };

  const submitForm = () => {
    closeModal();
    if (team !== 1 && team !== 2) return;
    addGameToSlip({
      gameId: game.id,
      teamId: team,
      name: team === 1 ? game.team1 : game.team2,
      spread: team === 1 ? game.team1Spread : game.team2Spread,
      imageSrc: team === 1 ? game.team1Url : game.team2Url,
      units: 0,
    });
  };

  const gameStarted = checkGameStarted(game.date);

  return (
    <>
      <li
        onClick={gameStarted ? undefined : openModal}
        className={classNames(
          !gameStarted && "cursor-pointer hover:bg-gray-800",
          "relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8",
        )}
      >
        <div className="min-w-0 flex-auto">
          <div className="flex items-center gap-x-3">
            <div
              className={classNames(
                gameStarted
                  ? "text-red-500 bg-red-100/10"
                  : "text-green-500 bg-green-100/10",
                "flex-none rounded-full p-1",
              )}
            >
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
              <span className="flex gap-x-2">
                <span className="truncate hidden md:block">{game.team2}</span>
                <span className="truncate md:hidden">
                  {game.team2.split(" ").pop()}
                </span>
                <span className="text-gray-400">@</span>
                <span className="whitespace-nowrap hidden md:block">
                  {game.team1}
                </span>
                <span className="whitespace-nowrap md:hidden">
                  {game.team1.split(" ").pop()}
                </span>
                <span className="absolute inset-0" />
              </span>
            </h2>
          </div>
          <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
            <p className="truncate">
              {game.team1Spread > 0
                ? `${game.team2} ${game.team2Spread}`
                : `${game.team1} ${game.team1Spread}`}
            </p>
            <svg
              viewBox="0 0 2 2"
              className="h-0.5 w-0.5 flex-none fill-gray-300 hidden sm:block"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            <p className="whitespace-nowrap hidden sm:block">
              {game.team1Spread > 0 ? "Visiting Favorite" : "Home Favorite"}
            </p>
          </div>
        </div>
        <img
          className="h-12 w-12 flex-none rounded-lg"
          src={game.team2Url}
          alt={game.team2}
        />
        <img
          className="h-12 w-12 flex-none rounded-lg"
          src={game.team1Url}
          alt={game.team1}
        />
        <div
          className={classNames(
            gameStarted
              ? "text-red-400 bg-red-400/10 ring-red-400/20"
              : "text-indigo-400 bg-indigo-400/10 ring-indigo-400/20",
            "hidden sm:block rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset",
          )}
        >
          {isFantasy ? "Fantasy Playoffs" : formatGameDate(game.date)}
        </div>
        <ChevronRightIcon
          className="h-5 w-5 flex-none text-gray-400"
          aria-hidden="true"
        />
      </li>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 hidden bg-gray-500 bg-opacity-75 transition-opacity md:block" />
          </Transition.Child>

          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
                enterTo="opacity-100 translate-y-0 md:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 md:scale-100"
                leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              >
                <Dialog.Panel className="flex w-full transform text-left text-base transition md:my-8 md:w-max md:px-4">
                  <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                    <button
                      type="button"
                      className="absolute right-4 top-4 text-gray-500 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="w-full">
                      <h2 className="text-2xl font-bold text-gray-900 sm:pr-12">
                        {game.team2.split(" ").pop()} @{" "}
                        {game.team1.split(" ").pop()}
                      </h2>

                      <section className="mt-4">
                        <div className="flex items-center">
                          <p className="font-medium text-gray-500">
                            {isFantasy ? "Fantasy Playoffs" : `Kickoff ${formatGameDate(game.date)}`}
                          </p>
                        </div>
                      </section>

                      <section
                        aria-labelledby="options-heading"
                        className="mt-6"
                      >
                        <div className="sm:flex sm:justify-between">
                          {/* Size selector */}
                          <RadioGroup value={team} onChange={setTeam}>
                            <RadioGroup.Label className="block text-sm font-medium text-gray-700">
                              Select Team
                            </RadioGroup.Label>
                            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <RadioGroup.Option
                                as="div"
                                value={1}
                                className={({ active }) =>
                                  classNames(
                                    active ? "ring-2 ring-indigo-500" : "",
                                    "relative block cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none",
                                  )
                                }
                              >
                                {({ active, checked }) => (
                                  <div className="flex min-w-0 gap-x-4">
                                    <img
                                      className="h-12 w-12 flex-shrink-0 rounded-lg"
                                      src={game.team1Url}
                                      alt={game.team1}
                                    />
                                    <div>
                                      <RadioGroup.Label
                                        as="p"
                                        className="text-base font-medium text-gray-900"
                                      >
                                        {game.team1}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="p"
                                        className="mt-1 text-sm text-gray-500"
                                      >
                                        <span
                                          className={classNames(
                                            game.team1Spread < game.team2Spread
                                              ? "bg-green-50 text-green-700 ring-green-600/20"
                                              : "bg-red-50 text-red-700 ring-red-600/20",
                                            "inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                          )}
                                        >
                                          {game.team1Spread > 0 && "+"}
                                          {game.team1Spread} @ {game.team1Price}
                                        </span>
                                      </RadioGroup.Description>
                                      <div
                                        className={classNames(
                                          active ? "border" : "border-2",
                                          checked
                                            ? "border-indigo-500"
                                            : "border-transparent",
                                          "pointer-events-none absolute -inset-px rounded-lg",
                                        )}
                                        aria-hidden="true"
                                      />
                                    </div>
                                  </div>
                                )}
                              </RadioGroup.Option>
                              <RadioGroup.Option
                                as="div"
                                value={2}
                                className={({ active }) =>
                                  classNames(
                                    active ? "ring-2 ring-indigo-500" : "",
                                    "relative block cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none",
                                  )
                                }
                              >
                                {({ active, checked }) => (
                                  <div className="flex min-w-0 gap-x-4">
                                    <img
                                      className="h-12 w-12 flex-shrink-0 rounded-lg"
                                      src={game.team2Url}
                                      alt={game.team2}
                                    />
                                    <div>
                                      <RadioGroup.Label
                                        as="p"
                                        className="text-base font-medium text-gray-900"
                                      >
                                        {game.team2}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="p"
                                        className="mt-1 text-sm text-gray-500"
                                      >
                                        <span
                                          className={classNames(
                                            game.team1Spread > game.team2Spread
                                              ? "bg-green-50 text-green-700 ring-green-600/20"
                                              : "bg-red-50 text-red-700 ring-red-600/20",
                                            "inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                                          )}
                                        >
                                          {game.team2Spread > 0 && "+"}
                                          {game.team2Spread} @ {game.team2Price}
                                        </span>
                                      </RadioGroup.Description>
                                      <div
                                        className={classNames(
                                          active ? "border" : "border-2",
                                          checked
                                            ? "border-indigo-500"
                                            : "border-transparent",
                                          "pointer-events-none absolute -inset-px rounded-lg",
                                        )}
                                        aria-hidden="true"
                                      />
                                    </div>
                                  </div>
                                )}
                              </RadioGroup.Option>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="mt-6">
                          <button
                            onClick={submitForm}
                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                          >
                            Add to Betslip
                          </button>
                        </div>
                        <div className="mt-6 text-center">
                          <span className="group inline-flex text-base font-medium">
                            <ShieldCheckIcon
                              className="mr-2 h-6 w-6 flex-shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <span className="text-gray-500">
                              Odds provided by DraftKings
                            </span>
                          </span>
                        </div>
                      </section>
                    </div>
                  </div>
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
      {({ open }) => (
        <>
          <Popover.Button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {open ? "Close Betslip" : "View Betslip"}
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
            <Popover.Panel className="absolute inset-x-0 top-16 mt-px bg-gray-900 md:bg-gray-800 pb-6 shadow-lg sm:px-2 lg:left-auto lg:right-0 lg:top-full lg:-mr-1.5 lg:mt-3 lg:w-80 lg:rounded-lg lg:ring-1 lg:ring-black lg:ring-opacity-5">
              <Form
                method="POST"
                action="/app/betslip"
                className="mx-auto max-w-2xl px-4"
              >
                <ul className="divide-y divide-gray-200">
                  {cart.map((team, index) => (
                    <li key={index} className="flex items-center py-6">
                      <img
                        src={team.imageSrc}
                        className="h-16 w-16 flex-none rounded-lg"
                        alt="team logo"
                      />
                      <div className="ml-4 flex-auto">
                        <h3 className="font-medium text-white">
                          {team.name} {team.spread > 0 && "+"}
                          {team.spread}
                        </h3>
                      </div>
                      <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                          <button
                            className="inline-flex rounded-md  p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-800 md:bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-600 focus:ring-offset-gray-50"
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
        </>
      )}
    </Popover>
  );
};
