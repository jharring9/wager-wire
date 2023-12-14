import type { V2_MetaFunction, ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { getBetsForCurrentWeek, isBetActive } from "~/models/bet.server";
import { getNFLWeek } from "~/utils";
import { classNames } from "~/shared";
import { requireUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [
  { title: "This Week's Bets - WagerWire" },
];

export const loader = async ({ request }: ActionArgs) => {
  const week = getNFLWeek().toString();
  const userId = await requireUserId(request);

  const userBetIsActive = await isBetActive({ userId, week });

  if (!userBetIsActive && userId !== "jharring9@gmail.com") {
    return json([]);
  }

  const currentWeekBets = await getBetsForCurrentWeek(week);
  if (!currentWeekBets) {
    throw new Response("Error loading this week's bets", { status: 400 });
  }
  return json(currentWeekBets);
};

/**
 * Displays all bets placed in the current week
 */
export default function WeeklyBets() {
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
                  This Week's Bets
                </span>
              </h1>
            </div>
            <p className="mt-2 text-xs leading-6 text-gray-400">
              Click a user's bet to view details
            </p>
          </div>
        </div>
      </header>

      <div className="border-t border-white/10 pt-6">
        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-8/12" />
            <col className="lg:w-4/12" />
          </colgroup>
          <thead className="border-b border-white/10 text-sm leading-6 text-white">
            <tr>
              <th
                scope="col"
                className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
              >
                User
              </th>
              <th
                scope="col"
                className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
              >
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data && data.length !== 0 ? (
              data.map((bet, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/app/${bet.userId}/${getNFLWeek()}`)}
                >
                  <td className="py-4 pl-4 pr-4 sm:pr-8 sm:pl-6 lg:pl-8">
                    <div className="flex items-center min-w-0 gap-x-4">
                      {/*<img*/}
                      {/*  className="h-12 w-12 flex-none"*/}
                      {/*  src={bet.teamUrl}*/}
                      {/*  alt={bet.teamName}*/}
                      {/*/>*/}
                      <p className="text-sm font-semibold leading-6 text-white truncate">
                        {bet.userName}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                    <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                      <span className="text-gray-400 sm:hidden">
                        {bet.scoringComplete ? "Complete" : "Pending"}
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
                        {bet.scoringComplete ? "Complete" : "Pending"}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 pl-4 pr-4 sm:pr-8 sm:pl-6 lg:pl-8">
                  <div className="flex items-center min-w-0 gap-x-4">
                    <p className="text-sm font-semibold leading-6 text-white truncate">
                      Locked until betslip is active.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
