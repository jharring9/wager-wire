import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { getUserBets } from "~/models/bet.server";
import { requireUserId } from "~/session.server";
import { getUserById } from "~/models/user.server";
import invariant from "tiny-invariant";
import { getWeekDays } from "~/utils";
import { classNames, formatISODate } from "~/shared";

export const meta: V2_MetaFunction = () => [
  { title: "User Profile - WagerWire" },
];

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.userId, "userId not found");
  let userId = await requireUserId(request);

  if (userId === params.userId) return redirect("/app/user/me");

  if (params.userId !== "me") userId = params.userId;

  const user = await getUserById(userId);
  if (!user) {
    throw new Response("User not found", { status: 400 });
  }
  const bets = await getUserBets({ userId });
  if (!bets) {
    throw new Response("User bets not found", { status: 400 });
  }

  let profit = 0;
  for (const bet of bets) {
    profit += bet.profit || 0;
  }

  let avgProfit = profit / (bets.length || 1);
  let roi = (profit / (bets.length * 5 || 1)) * 100;
  roi = Math.round((roi + Number.EPSILON) * 100) / 100;
  avgProfit = Math.round((avgProfit + Number.EPSILON) * 100) / 100;

  return json({ user, bets, profit, avgProfit, roi });
};

/**
 * Displays a user's bets for the season.
 */
export default function UserBetsPage() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <>
      <header>
        {/* Heading */}
        <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-x-3">
              <h1 className="flex gap-x-3 text-base leading-7">
                <span className="font-semibold text-white">WagerWire</span>
                <span className="text-gray-600">/</span>
                <span className="font-semibold text-white">
                  {data.user.name}
                </span>
              </h1>
            </div>
            <p className="mt-2 text-xs leading-6 text-gray-400">
              Click on a bet to view more details
            </p>
          </div>
          <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
            {data.user.rankingType === "PUBLIC" ? "Public" : "Private"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 bg-gray-700/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Bets Placed
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {data.bets.length}
              </span>
            </p>
          </div>
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 sm:border-l">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Total Profit
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {data.profit}
              </span>
              <span className="text-sm text-gray-400">units</span>
            </p>
          </div>
          <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 lg:border-l">
            <p className="text-sm font-medium leading-6 text-gray-400">
              Average Profit
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {data.avgProfit}
              </span>
              <span className="text-sm text-gray-400">units/week</span>
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
          Recent Bets
        </h2>
        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-4/12" />
            <col className="lg:w-4/12" />
            <col className="lg:w-2/12" />
            <col className="lg:w-1/12" />
            <col className="lg:w-1/12" />
          </colgroup>
          <thead className="border-b border-white/10 text-sm leading-6 text-white">
            <tr>
              <th
                scope="col"
                className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
              >
                NFL Week
              </th>
              <th
                scope="col"
                className="hidden md:table-cell pl-0 pr-8 font-semibold"
              >
                Teams
              </th>
              <th
                scope="col"
                className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
              >
                Status
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
              >
                Profit
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
              >
                Date Placed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.bets
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((bet, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/app/${data.user.id}/${bet.week}`)}
                >
                  <td className="py-4 pl-4 pr-4 sm:pr-8 sm:pl-6 lg:pl-8">
                    <div className="flex gap-x-3">
                      <div className="font-mono text-sm leading-6 text-gray-400">
                        Week {bet.week}
                      </div>
                      <span className="hidden sm:block inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
                        {getWeekDays(bet.week)}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-4 pl-0 pr-4 sm:pr-8">
                    <div className="flex items-center gap-x-2">
                      {bet.logos.map((logo, index) => (
                        <img
                          key={index}
                          src={logo}
                          alt="team logo"
                          className="h-10 w-10"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                    <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                      <span className="text-gray-400 sm:hidden">
                        {bet.profit && bet.profit > 0 && "+"}
                        {bet.profit || 0} units
                      </span>
                      <div
                        className={classNames(
                          bet.scoringComplete
                            ? "text-green-400 bg-green-400/10"
                            : "text-yellow-400 bg-yellow-400/10",
                          "flex-none rounded-full p-1",
                        )}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      </div>
                      <div className="hidden text-white sm:block">
                        {bet.scoringComplete ? "Completed" : "In Progress"}
                      </div>
                    </div>
                  </td>
                  <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:table-cell lg:pr-20">
                    {bet.profit && bet.profit > 0 && "+"}
                    {bet.profit || 0} units
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
