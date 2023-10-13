import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { useUser } from "~/utils";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getUserBets } from "~/models/bet.server";
import { requireUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "WagerWire - Your Bets" }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const bets = await getUserBets({ userId });
  if (!bets) {
    throw new Response("User not found", { status: 400 });
  }
  return json(bets);
};

/**
 * Displays the current user's profile, including all of their bets.
 */
export default function YourBetsPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Your Information
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Only your display name is publicly available.
        </p>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Display Name
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{user.name}</div>
              <button
                type="button"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Update
              </button>
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Password
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">********</div>
              <button
                type="button"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Update
              </button>
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Email address
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{user.email}</div>
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Your Bets
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          See all of your bets for the current season. Click on a bet to open the slip.
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
                        NFL Week
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Net Profit (Units)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.map((bet, index) => (
                      <tr
                        key={index}
                        onClick={() => navigate(`/bets/me/${bet.week}`)}
                        className="bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center min-w-0 gap-x-4">
                            <p className="text-sm font-semibold leading-6 text-gray-900">
                              {bet.week}
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <p className="text-sm font-semibold leading-6 text-gray-900">
                            {bet.profit || 0}
                          </p>
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
    </div>
  );
}
