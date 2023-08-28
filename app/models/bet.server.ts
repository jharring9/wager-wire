import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

import type { User } from "~/models/user.server";
import type { Game } from "~/models/game.server";

export type Bet = {
  id: ReturnType<typeof createId>;
  userId: User["id"];
  gameId: Game["id"];
  selectedLine: string;
};

type BetItem = {
  pk: User["id"];
  sk: `bet#${Bet["id"]}`;
};

const skToId = (sk: BetItem["sk"]): Bet["id"] => sk.replace(/^bet#/, "");
const idToSk = (id: Bet["id"]): BetItem["sk"] => `bet#${id}`;

export async function getBet({
  id,
  userId,
}: Pick<Bet, "id" | "userId">): Promise<Bet | null> {
  const db = await arc.tables();

  const result = await db.bet.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      gameId: result.gameId,
      selectedLine: result.selectedLine,
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
    title: n.title,
    id: skToId(n.sk),
  }));
}

export async function createBet({
  gameId,
  selectedLine,
  userId,
}: Pick<Bet, "gameId" | "selectedLine" | "userId">): Promise<Bet> {
  const db = await arc.tables();

  const result = await db.bet.put({
    pk: userId,
    sk: idToSk(createId()),
    gameId: gameId,
    selectedLine: selectedLine,
  });

  return {
    id: skToId(result.sk),
    userId: result.pk,
    gameId: result.gameId,
    selectedLine: result.selectedLine,
  };
}

export async function deleteBet({ id, userId }: Pick<Bet, "id" | "userId">) {
  const db = await arc.tables();
  return db.bet.delete({ pk: userId, sk: idToSk(id) });
}
