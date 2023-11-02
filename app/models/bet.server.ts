import arc from "@architect/functions";
import type { User } from "~/models/user.server";
import type { Game } from "~/models/game.server";
import { getUserById } from "~/models/user.server";
import { getNFLWeek } from "~/utils";
import { DateTime } from "luxon";

/**
 * A Bet is a collection of BetSlipItems that a User has placed for a given
 * week. The BetSlipItems are the actual bets that the User has placed. At the
 * end of the week, the bets are scored and the User's profit is calculated.
 */
export type Bet = {
  userId: User["id"];
  week: string;
  betSlip: BetSlipItem[];
  profit?: number;
  scoringComplete: boolean;
  date: string;
};

/**
 * A BetSlipItem is a single bet that a User has placed for a given game. It
 * belongs to a Bet and is scored at the end of the week. The User's profit is
 * determined by the number of units placed on the bet and the outcome of the
 * game.
 */
export type BetSlipItem = {
  gameId: Game["id"];
  teamId: number;
  units: number;
};

/**
 * A BetResult is the outcome of a BetSlipItem. It is either a win, loss, or
 * pending. A pending BetResult means that the game has not yet been played, or
 * that the bet has pushed.
 */
export type BetResult = "win" | "loss" | "pending";

/**
 * A BetWithData is a Bet that has been enriched with the User's name, as well
 * as information about the bet. It is used to display a User's bet slip on the
 * frontend without having to make additional round-trip requests to the backend
 * for each item in the bet slip.
 */
export type BetWithData = {
  userId: Bet["userId"];
  userName: User["name"];
  week: Bet["week"];
  date: Bet["date"];
  profit: Bet["profit"];
  scoringComplete: Bet["scoringComplete"];
  betSlip: BetSlipItemWithData[];
};

/**
 * A BetSlipItemWithData is a BetSlipItem that has been enriched with bet data
 * by de-normalizing the data from the Game table. The team name, spread, logo
 * URL, and bet status are all resolved and returned in the BetSlipItemWithData.
 */
export type BetSlipItemWithData = BetSlipItem & {
  teamName: Game["team1"] | Game["team2"];
  teamSpread: Game["team1Spread"] | Game["team2Spread"];
  teamUrl: Game["team1Url"] | Game["team2Url"];
  date: Game["date"];
  status: BetResult;
};

/**
 * A ListBetItem is a Bet that has been slimmed down to only the data needed
 * when listing all previous bets for a User.
 */
export type ListBetItem = {
  week: string;
  scoringComplete: boolean;
  profit: number;
  date: string;
  logos: string[];
};

/**
 * A BetWithUserName is a Bet with the User's name and email address. It is used
 * to display a list of all bets for a given week in the weekly bets UI.
 */
export type BetWithUserName = Bet & {
  userName: User["name"];
  email: User["email"];
};

/**
 * Get a Bet object from DynamoDB via the User's ID and the week that the bet
 * was placed.
 * @param week The week that the bet was placed.
 * @param userId The User's ID.
 */
export async function getBet({
  week,
  userId,
}: Pick<Bet, "week" | "userId">): Promise<Bet | null> {
  const db = await arc.tables();

  const result = await db.bet.get({ pk: userId, sk: week });

  if (result) {
    return {
      userId: result.pk,
      week: result.sk,
      betSlip: result.betSlip,
      profit: result.profit,
      scoringComplete: result.scoringComplete,
      date: result.date,
    };
  }

  return null;
}

/**
 * Get a BetWithData object from DynamoDB via the User's ID and the week that
 * the bet was placed. Includes the User's name and information about the bet.
 * @param userId The User's ID.
 * @param week The week that the bet was placed.
 */
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
    date: bet.date,
    profit: bet.profit,
    scoringComplete: bet.scoringComplete,
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
      date: game.date,
    });
  }

  return betWithData;
}

/**
 * Get all bets for a given User.
 * @param userId The User's ID.
 */
export async function getUserBets({
  userId,
}: Pick<Bet, "userId">): Promise<Array<ListBetItem>> {
  const db = await arc.tables();

  const result = await db.bet.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  const bets: Array<ListBetItem> = [];
  for (const item of result.Items) {
    const logos: ListBetItem["logos"] = [];
    for (const betItem of item.betSlip) {
      const game = await db.game.get({ week: item.sk, id: betItem.gameId });
      if (!game) continue;
      logos.push(betItem.teamId === 1 ? game.team1Url : game.team2Url);
    }
    bets.push({
      week: item.sk,
      scoringComplete: item.scoringComplete,
      profit: item.profit,
      date: item.date,
      logos: logos,
    });
  }
  return bets;
}

/**
 * Get the User's bet for the current week.
 * @param userId The User's ID.
 */
export async function getUserCurrentBet({
  userId,
}: Pick<Bet, "userId">): Promise<Bet | null> {
  const db = await arc.tables();

  const result = await db.bet.get({
    pk: userId,
    sk: getNFLWeek().toString(),
  });

  if (result) {
    return {
      userId: result.pk,
      week: result.sk,
      betSlip: result.betSlip,
      scoringComplete: result.scoringComplete,
      date: result.date,
    };
  }
  return null;
}

/**
 * Get all bets for the current week, placed by all Users.
 */
export async function getBetsForCurrentWeek(): Promise<Array<BetWithUserName>> {
  const db = await arc.tables();

  const currentWeek = `${getNFLWeek()}`;

  const betsResult = await db.bet.query({
    IndexName: "byWeek",
    KeyConditionExpression: "sk = :weekValue",
    ExpressionAttributeValues: {
      ":weekValue": currentWeek,
    },
    ProjectionExpression: "pk, sk, scoringComplete", // Update if more data is desired
  });

  // For each bet, get the user's name
  const betsWithUserName: Array<BetWithUserName> = [];
  for (const bet of betsResult.Items) {
    const user = await getUserById(bet.pk);
    if (user) {
      betsWithUserName.push({
        ...bet,
        userName: user.name,
        userId: user.id,
      });
    }
  }

  return betsWithUserName;
}

/**
 * Create a new Bet in DynamoDB.
 * @param userId The User's ID.
 * @param week The week that the bet was placed.
 * @param betSlip The BetSlipItems that the User has selected.
 */
export async function createBet({
  userId,
  week,
  betSlip,
}: Pick<Bet, "userId" | "week" | "betSlip">): Promise<Bet> {
  const db = await arc.tables();

  const result = await db.bet.put({
    pk: userId,
    sk: week,
    betSlip: betSlip,
    scoringComplete: false,
    date: DateTime.utc().setZone("America/Chicago").toISO(),
  });

  return {
    userId: result.pk,
    week: result.sk,
    betSlip: result.betSlip,
    scoringComplete: result.scoringComplete,
    date: result.date,
  };
}
