import type { V2_MetaFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { getTop25UsersByProfit } from "~/models/user.server";
import { useLoaderData, useNavigate } from "@remix-run/react";

export const meta: V2_MetaFunction = () => [{ title: "WagerWire - Standings" }];

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const top25 = await getTop25UsersByProfit();
  if (!top25) {
    throw new Response("Error loading top 25", { status: 400 });
  }
  return json(top25);
};

/**
 * Displays the top 25 users by net profit.
 */
export default function Standings() {
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
                  Season Standings
                </span>
              </h1>
            </div>
            <p className="mt-2 text-xs leading-6 text-gray-400">
              Click a user's name to view their profile
            </p>
          </div>
        </div>
      </header>

      <div className="border-t border-white/10 pt-6">
        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-1/12 md:w-3/12" />
            <col className="w-6/12 md:w-6/12" />
            <col className="w-5/12 md:w-3/12" />
          </colgroup>
          <thead className="border-b border-white/10 text-sm leading-6 text-white">
            <tr>
              <th
                scope="col"
                className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
              >
                Rank
              </th>
              <th
                scope="col"
                className="py-2 pl-0 pr-4 font-semibold sm:pr-8 sm:text-left lg:pr-20"
              >
                User
              </th>
              <th
                scope="col"
                className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
              >
                Profit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.map((user, index) => (
              <tr
                key={index}
                className="hover:bg-gray-800 cursor-pointer"
                onClick={() => navigate(`/app/user/${user.id}`)}
              >
                <td className="py-4 pl-4 pr-4 sm:pr-8 sm:pl-6 lg:pl-8">
                  <p className="text-sm font-semibold leading-6 text-white truncate">
                    {index + 1}
                  </p>
                </td>
                <td className="py-4 pl-0 pr-4 sm:pr-8">
                  <div className="flex items-center min-w-0 gap-x-4">
                    {/*<img*/}
                    {/*  className="h-12 w-12 flex-none"*/}
                    {/*  src={user.teamUrl}*/}
                    {/*  alt={user.teamName}*/}
                    {/*/>*/}
                    <p className="text-sm font-semibold leading-6 text-white truncate">
                      {user.name}
                    </p>
                  </div>
                </td>
                <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                  <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                    <div className="text-white">
                      {user.totalProfit > 0 ? "+" : ""}
                      {user.totalProfit}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
