import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { getBetsForCurrentWeek, getUserCurrentBet } from "~/models/bet.server";
import { getNFLWeek } from "~/utils";

export const meta: V2_MetaFunction = () => [
  { title: "WagerWire - This Week's Bets" },
];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  // Check if current user has placed a bet this week
  const bet = await getUserCurrentBet({ userId });
  if (!bet) {
    return json(null);
  }

  const currentWeekBets = await getBetsForCurrentWeek();
  if (!currentWeekBets) {
    throw new Response("Error loading this week's bets", { status: 400 });
  }
  return json(currentWeekBets);
};

export default function WeeklyBets() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          This Week's Bets
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          {!data
            ? "Please place your bet to view other users' bets this week."
            : "Click on a user to view their betslip."}
        </p>

        {!!data && (
          <div className="flow-root mt-6">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data?.map((bet, index) => (
                        <tr
                          key={index}
                          onClick={() =>
                            navigate(`/bets/${bet.email}/${getNFLWeek()}`)
                          }
                          className="bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex items-center min-w-0 gap-x-4">
                              <p className="text-sm font-semibold leading-6 text-gray-900">
                                {bet.userName}
                              </p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {bet.scoringComplete === true ? (
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
