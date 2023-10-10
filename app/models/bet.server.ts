import arc from "@architect/functions";
import type { User } from "~/models/user.server";
import type { Game } from "~/models/game.server";
import { getUserById } from "~/models/user.server";

export type Bet = {
  userId: User["id"];
  week: string;
  betSlip: BetSlipItem[];
  profit?: number;
  scoringComplete: boolean;
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

export type BetResult = "win" | "loss" | "pending";

export type BetWithData = {
  userId: User["id"];
  userName: User["name"];
  week: string;
  betSlip: BetSlipItemWithData[];
};

export type BetSlipItemWithData = BetSlipItem & {
  teamName: string;
  teamSpread: number;
  teamUrl: string;
  status: BetResult;
};

export type ListBetItem = {
  week: string;
  scoringComplete: boolean;
  profit: number;
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
      scoringComplete: result.scoringComplete,
    };
  }
  return null;
}

export async function getBetWithData({
  userId,
  week,
}: Pick<Bet, "userId" | "week">): Promise<BetWithData | null> {
  const bet = await getBet({ userId, week });
  if (!bet) {
    return null;
  }

  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  const db = await arc.tables();
  const betWithData: BetWithData = {
    userId: bet.userId,
    userName: user.name,
    week: bet.week,
    betSlip: [],
  };

  for (const betItem of bet.betSlip) {
    const game = await db.game.get({ week: week, id: betItem.gameId });
    if (!game) continue;

    const userTeam = betItem.teamId === 1 ? game.team1 : game.team2;
    const userTeamSpread =
      betItem.teamId === 1 ? game.team1Spread : game.team2Spread;
    const userTeamUrl = betItem.teamId === 1 ? game.team1Url : game.team2Url;

    let status: BetResult;
    if (!game.winner || game.winner === 0) {
      status = "pending";
    } else {
      status =
        (game.winner === 1 && betItem.teamId === 1) ||
        (game.winner === 2 && betItem.teamId === 2)
          ? "win"
          : "loss";
    }

    betWithData.betSlip.push({
      gameId: betItem.gameId,
      teamId: betItem.teamId,
      units: betItem.units,
      teamName: userTeam,
      teamSpread: userTeamSpread,
      teamUrl: userTeamUrl,
      status: status,
    });
  }

  return betWithData;
}

export async function getUserBets({
  userId,
}: Pick<Bet, "userId">): Promise<Array<ListBetItem>> {
  const db = await arc.tables();

  const result = await db.bet.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  console.log(result.Items);

  return result.Items.map((result) => ({
    week: skToWeek(result.sk),
    profit: result.profit,
    scoringComplete: result.scoringComplete,
  }));
}

export async function createBet({
  userId,
  week,
  betSlip,
}: Pick<Bet, "userId" | "week" | "betSlip">): Promise<Bet> {
  const db = await arc.tables();

  const result = await db.bet.put({
    pk: userId,
    sk: weekToSk(week),
    betSlip: betSlip,
    scoringComplete: false,
  });

  return {
    userId: result.pk,
    week: skToWeek(result.sk),
    betSlip: result.betSlip,
    scoringComplete: result.scoringComplete,
  };
}
