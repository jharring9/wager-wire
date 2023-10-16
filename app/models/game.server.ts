import arc from "@architect/functions";
import { getNFLWeek } from "~/utils";

/**
 * A Game is a single NFL game that is being played during a given week.
 */
export type Game = {
  id: string;
  week: number;
  team1: string;
  team2: string;
  team1Spread: number;
  team2Spread: number;
  team1Price: number;
  team2Price: number;
  team1Url: string;
  team2Url: string;
  date: string;
  winner: number; // ATS winner - 1, 2, or 0 if game hasn't been played yet
};

/**
 * Get all games for the current week.
 */
export async function getCurrentGames(): Promise<Array<Game>> {
  const db = await arc.tables();

  const games = await db.game.query({
    KeyConditionExpression: "week = :week",
    ExpressionAttributeValues: {
      ":week": getNFLWeek().toString(),
    },
  });

  return games.Items;
}
