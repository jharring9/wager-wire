import arc from "@architect/functions";
import type { User } from "~/models/user.server";
import type { Game } from "~/models/game.server";

export type Bet = {
  userId: User["id"];
  week: string;
  betSlip: BetSlipItem[];
};

export type BetSlipItem = {
  gameId: Game["id"];
  teamId: number;
  units: number;
};

type BetItem = {
  pk: User["id"];
  sk: `bet#${Bet["week"]}`;
};

const skToWeek = (sk: BetItem["sk"]): Bet["week"] => sk.replace(/^bet#/, "");
const weekToSk = (id: Bet["week"]): BetItem["sk"] => `bet#${id}`;

export async function getBet({
  week,
  userId,
}: Pick<Bet, "week" | "userId">): Promise<Bet | null> {
  const db = await arc.tables();

  const result = await db.bet.get({ pk: userId, sk: weekToSk(week) });

  if (result) {
    return {
      userId: result.pk,
      week: skToWeek(result.sk),
      betSlip: result.betSlip,
    };
  }
  return null;
}

export async function getUserBetByWeek({
  userId,
  week,
}: Pick<Bet, "userId" | "week">): Promise<Array<Bet>> {
  const db = await arc.tables();

  return await db.bet.get({
    pk: userId,
    sk: weekToSk(week),
  });
}

export async function getBetListItems({
  userId,
}: Pick<Bet, "userId">): Promise<Array<Bet>> {
  const db = await arc.tables();

  const result = await db.bet.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((result) => ({
    userId: result.pk,
    week: skToWeek(result.sk),
    betSlip: result.betSlip,
  }));
}

export async function createBet({ userId, week, betSlip }: Bet): Promise<Bet> {
  const db = await arc.tables();

  const result = await db.bet.put({
    pk: userId,
    sk: weekToSk(week),
    betSlip: betSlip,
  });

  return {
    userId: result.pk,
    week: skToWeek(result.sk),
    betSlip: result.betSlip,
  };
}

export async function deleteBet({
  userId,
  week,
}: Pick<Bet, "userId" | "week">) {
  const db = await arc.tables();
  return db.bet.delete({ pk: userId, sk: weekToSk(week) });
}
