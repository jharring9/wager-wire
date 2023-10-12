import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { getTop25UsersByProfit } from "~/models/user.server";
import { useLoaderData, useNavigate } from "@remix-run/react";

export const meta: V2_MetaFunction = () => [{ title: "WagerWire - Standings" }];

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const top25 = await getTop25UsersByProfit();
  console.log("received top 25 from backend:", top25)
  if (!top25) {
    throw new Response("Error loading top 25", { status: 400 });
  }
  return json(top25);
};

export default function Standings() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Season Standings
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Rankings are calculated by total net profit, in units. Click on a user
          to view their betting history.
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
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        User
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
                    {data.map((user, index) => (
                      <tr
                        key={index}
                        onClick={() => navigate(`/bets/user/${user.email}`)}
                        className="bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center min-w-0 gap-x-4">
                            <p className="text-sm font-semibold leading-6 text-gray-900">
                              #{index + 1}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <p className="text-sm leading-6 text-gray-900">
                            {user.totalProfit || 0}
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
