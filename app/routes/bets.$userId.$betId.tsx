import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { getBetWithData } from "~/models/bet.server";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Alert } from "~/routes/wager";

export const meta: V2_MetaFunction = () => [{ title: "WagerWire - Bet" }];

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
  return json(bet);
};

/**
 * Displays a user's bet slip for a given week.
 */
export default function DisplayUserBet() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const alertText = searchParams.get("alert");

  return (
    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
      <Alert text={alertText} />
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        <Link to={`/bets/user/${data.userId}`} className="text-indigo-600">
          {data.userName}
        </Link>
        's Week {data?.week} Betslip
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Click the user's name to view their betting history.
      </p>
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
                      Bet
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Units
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.betSlip.map((bet, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <div className="flex items-center min-w-0 gap-x-4">
                          <img
                            className="h-12 w-12 flex-none"
                            src={bet.teamUrl}
                            alt={bet.teamName}
                          />
                          <p className="text-sm font-semibold leading-6 text-gray-900 truncate">
                            {bet.teamName} {bet.teamSpread > 0 && "+"}
                            {bet.teamSpread}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          {bet.units}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bet.status === "win" ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Won
                          </span>
                        ) : bet.status === "loss" ? (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                            Lost
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                            Pending
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
    </div>
  );
}
