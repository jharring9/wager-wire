import { getNFLWeek } from "~/utils";
import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { createBet } from "~/models/bet.server";
import { requireUserId } from "~/session.server";
import { Notification } from "~/shared";

export const meta: V2_MetaFunction = () => [
  { title: "WagerWire - Your Betslip" },
];

export const action = async (args: ActionArgs) => {
  const formData = await args.request.clone().formData();
  const _action = formData.get("_action");

  switch (_action) {
    case "accept":
      return acceptBetSlip(args);
    case "submit":
      return submitBetSlip(args);
    default:
      return redirect("/app/wager");
  }
};

const acceptBetSlip = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const bets = JSON.parse(formData.get("cart") as string);
  if (!bets || typeof bets !== "object" || bets.length === 0)
    throw redirect("/app/wager");
  return bets;
};

const submitBetSlip = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const bets = JSON.parse(formData.get("slip") as string);
  if (!bets || typeof bets !== "object" || bets.length === 0)
    throw redirect("/app/wager");

  let totalUnits = 0;
  for (const bet of bets) {
    if (!bet.units || bet.units <= 0)
      return json(
        { error: "You must wager more than 0 on each leg." },
        { status: 400 },
      );
    totalUnits += parseFloat(bet.units);
  }
  if (totalUnits > 5)
    return json(
      {
        error: `You may wager no more than 5 units. You have wagered ${totalUnits}.`,
      },
      { status: 400 },
    );

  const userId = await requireUserId(request);
  const week = getNFLWeek().toString();
  const betSlip = bets?.map((bet) => {
    return {
      gameId: bet.gameId,
      teamId: bet.teamId,
      units: bet.units,
    };
  });

  const result = await createBet({ userId, week, betSlip });
  if (result)
    return redirect(
      `/app/me/${result.week}?alert=You have successfully placed your bet!`,
    );
  return json(
    {
      error:
        "Game(s) in your existing betslip have already started. Please try again next week.",
    },
    { status: 400 },
  );
};

/**
 * Displays a UI to confirm and submit a betslip.
 */
export default function SubmitBetslip() {
  const [bets, setBets] = useState(useActionData<typeof action>() || []);
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const removeBet = (index: number) => {
    const newBets = [...bets];
    newBets.splice(index, 1);
    setBets(newBets);

    if (newBets.length === 0) navigate("/app/wager");
  };

  const updateUnits = (index: number, units: number) => {
    const newBets = [...bets];
    newBets[index].units = units;
    setBets(newBets);
  };

  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Your Week {getNFLWeek()} Betslip
            </h1>
            <div className="mt-3 sm:ml-4 sm:mt-0">
              <Form method="POST">
                <input type="hidden" name="slip" value={JSON.stringify(bets)} />
                <button
                  type="submit"
                  name="_action"
                  value="submit"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Submit Betslip
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Notification error text={actionData?.error} />
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Page-specific content below */}
          <Betslip
            bets={bets || []}
            removeBet={removeBet}
            updateUnits={updateUnits}
          />
        </div>
      </main>
    </div>
  );
}

const Betslip = ({ bets, removeBet, updateUnits }) => {
  return (
    <div className="mt-8 flow-root">
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
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {bets.map((bet, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center min-w-0 gap-x-4">
                        <img
                          className="h-12 w-12 flex-none"
                          src={bet.imageSrc}
                          alt={bet.name}
                        />
                        <p className="text-sm truncate font-semibold leading-6 text-gray-900">
                          {bet.name} {bet.spread > 0 && "+"}
                          {bet.spread}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <input
                        type="number"
                        value={bet.units}
                        onChange={(e) => updateUnits(index, e.target.value)}
                        className="bg-gray-50 w-14 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1"
                        placeholder="1"
                        required
                      ></input>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <span
                        onClick={() => removeBet(index)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        Remove
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
