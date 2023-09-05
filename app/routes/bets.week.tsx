import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [
  { title: "WagerWire - Weekly Bets" },
];

export default function Standings() {
  return (
    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
      <h1>This week's bets are coming soon.</h1>
    </div>
  );
}
