import type { V2_MetaFunction } from "@remix-run/node";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { json, LoaderArgs } from "@remix-run/node";
import { getCurrentGames } from "~/models/game.server";
import { useLoaderData } from "@remix-run/react";

export const meta: V2_MetaFunction = () => [{ title: "Wager Wire" }];

export const loader = async ({ request }: LoaderArgs) => {
  const currentGames = await getCurrentGames();
  return json({ currentGames });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <main className="-mt-64">
      <header className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            This Week's Bets
          </h1>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Page-specific content below */}
        <ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          {games.map((game) => (
            <li
              key={game.id}
              className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 cursor-pointer hover:bg-gray-200"
            >
              <div className="flex min-w-0 gap-x-4">
                <img className="h-12 w-12 flex-none" src={game.team1Url} alt="" />
                <img className="h-12 w-12 flex-none" src={game.team2Url} alt="" />
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
                  {/*<p className="text-sm leading-6 text-gray-900">test</p>*/}

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
          ))}
        </ul>
      </div>
    </main>
  );
}

const games = [
  {
    id: 1,
    team1: "Tennessee Titans",
    team2: "New Orleans Saints",
    team1Spread: 3.5,
    team2Spread: -3.5,
    team1Url: "https://wagerwire-webassets.s3.amazonaws.com/titans.png",
    team2Url: "https://wagerwire-webassets.s3.amazonaws.com/saints.png",
    date: "Sept. 10th @ 1:00pm",
  },
  {
    id: 2,
    team1: "Detroit Lions",
    team2: "Kansas City Chiefs",
    team1Spread: 6.5,
    team2Spread: -6.5,
    team1Url: "https://wagerwire-webassets.s3.amazonaws.com/lions.png",
    team2Url: "https://wagerwire-webassets.s3.amazonaws.com/chiefs.png",
    date: "Sept. 7th @ 8:20pm",
  },
  {
    id: 3,
    team1: "Cincinnati Bengals",
    team2: "Cleveland Browns",
    team1Spread: -9.5,
    team2Spread: 9.5,
    team1Url: "https://wagerwire-webassets.s3.amazonaws.com/bengals.png",
    team2Url: "https://wagerwire-webassets.s3.amazonaws.com/browns.png",
    date: "Sept. 10th @ 1:00pm",
  },
];
