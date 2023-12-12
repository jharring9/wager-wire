import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { getBetWithData } from "~/models/bet.server";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  classNames,
  Notification,
  formatISODate,
  formatShortDate,
} from "~/shared";

export const meta: V2_MetaFunction = () => [{ title: "View Bet - WagerWire" }];

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.userId, "userId not found");
  invariant(params.betId, "betId not found");

  const bet = await getBetWithData({
    week: params.betId,
    userId:
      params.userId === "me" ? await requireUserId(request) : params.userId,
  });
  if (!bet) {
    throw new Response("Bet or user not found", { status: 400 });
  }

  let unitsWagered = 0.0;
  for (const betItem of bet.betSlip) {
    unitsWagered += parseFloat(betItem.units.toString() || "0");
  }

  let roi = ((bet.profit || 0) / unitsWagered) * 100;
  roi = Math.round((roi + Number.EPSILON) * 100) / 100;

  return json({ bet, roi, unitsWagered });
};

/**
 * Displays a user's bet slip for a given week.
 */
export default function DisplayUserBet() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const alertText = searchParams.get("alert");

  const gameStatusFormat = {
    win: "text-green-400 bg-green-400/10",
    loss: "text-rose-400 bg-rose-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
  };

  return (
    <>
      <Notification text={alertText} />
      <header>
        {/* Heading */}
        <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-x-3">
              <h1 className="flex gap-x-3 text-base leading-7">
                <span className="font-semibold text-white">WagerWire</span>
                <span className="text-gray-600">/</span>
                <Link
                  to={`/app/user/${data.bet.userId}`}
                  className="font-semibold text-white hover:text-gray-500 cursor-pointer"
                >
                  {data.bet.userName}
                </Link>
                <span className="text-gray-600">/</span>
                <span className="font-semibold text-white">
                  Week {data.bet.week} Betslip
                </span>
              </h1>
            </div>
            <p className="mt-2 text-xs leading-6 text-gray-400">
              Click the user's name to return to their profile.
            </p>
          </div>
          <div
            className={classNames(
              data.bet.scoringComplete
                ? "bg-green-400/10 text-green-400 ring-green-400/30"
                : "bg-yellow-400/10 text-yellow-400 ring-yellow-400/30",
              "order-first flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset sm:order-none",
            )}
          >
            {data.bet.scoringComplete ? "Scored" : "Pending"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 bg-gray-700/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Total Wagered
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {data.unitsWagered}
              </span>
              <span className="text-sm text-gray-400">units</span>
            </p>
          </div>
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 sm:border-l">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Total Profit
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {data.bet.profit || 0}
              </span>
              <span className="text-sm text-gray-400">units</span>
            </p>
          </div>
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 lg:border-l">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Date Placed
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {formatShortDate(data.bet.date)}
              </span>
            </p>
          </div>
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 sm:border-l">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Return on Investment
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {data.roi}%
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="border-t border-white/10 pt-11">
        <h2 className="px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">
          Betslip Details
        </h2>
        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-6/12" />
            <col className="lg:w-2/12" />
            <col className="lg:w-2/12" />
            <col className="lg:w-2/12" />
          </colgroup>
          <thead className="border-b border-white/10 text-sm leading-6 text-white">
            <tr>
              <th
                scope="col"
                className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
              >
                Bet
              </th>
              <th
                scope="col"
                className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
              >
                Result
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
              >
                Wager
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
              >
                Game Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.bet.betSlip.map((bet, index) => (
              <tr key={index}>
                <td className="py-4 pl-4 pr-4 sm:pr-8 sm:pl-6 lg:pl-8">
                  <div className="flex items-center min-w-0 gap-x-4">
                    <img
                      className="h-12 w-12 flex-none rounded-lg"
                      src={bet.teamUrl}
                      alt={bet.teamName}
                    />
                    <p className="text-sm font-semibold leading-6 text-white truncate">
                      {bet.teamName} {bet.teamSpread > 0 && "+"}
                      {bet.teamSpread}
                    </p>
                  </div>
                </td>
                <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                  <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                    <span className="text-gray-400 sm:hidden">
                      {bet.units} units
                    </span>
                    <div
                      className={classNames(
                        gameStatusFormat[bet.status],
                        "flex-none rounded-full p-1",
                      )}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    </div>
                    <div className="hidden text-white sm:block">
                      {bet.status === "win"
                        ? "Won"
                        : bet.status === "loss"
                        ? "Lost"
                        : "Pending"}
                    </div>
                  </div>
                </td>
                <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:table-cell lg:pr-20">
                  {bet.units} units
                </td>
                <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                  {formatISODate(bet.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
