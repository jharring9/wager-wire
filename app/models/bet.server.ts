import arc from "@architect/functions";
import type { User } from "~/models/user.server";
import type { Game } from "~/models/game.server";

export type Bet = {
  userId: User["id"];
  week: string;
  gameId: Game["id"];
  selectedTeam: string;
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
      gameId: result.gameId,
      selectedTeam: result.selectedTeam,
    };
  }
  return null;
}

export async function getBetListItems({
  userId,
}: Pick<Bet, "userId">): Promise<Array<Bet>> {
  const db = await arc.tables();

  const result = await db.bet.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((n: any) => ({
    userId: n.pk,
    week: skToWeek(n.sk),
    gameId: n.gameId,
    selectedTeam: n.selectedTeam,
  }));
}

export async function createBet({
  gameId,
  selectedTeam,
  userId,
  week,
}: Bet): Promise<Bet> {
  const db = await arc.tables();

  const result = await db.bet.put({
    pk: userId,
    sk: weekToSk(week),
    gameId: gameId,
    selectedTeam: selectedTeam,
  });

  return {
    userId: result.pk,
    week: skToWeek(result.sk),
    gameId: result.gameId,
    selectedTeam: result.selectedTeam,
  };
}

export async function deleteBet({
  userId,
  week,
}: Pick<Bet, "userId" | "week">) {
  const db = await arc.tables();
  return db.bet.delete({ pk: userId, sk: weekToSk(week) });
}
