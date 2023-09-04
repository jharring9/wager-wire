import arc from "@architect/functions";
import { getNFLWeek } from "~/utils";

export type Game = {
  id: string;
  week: number;
  team1: string;
  team2: string;
  team1Spread: number;
  team2Spread: number;
  team1Url: string;
  team2Url: string;
  date: string;
  winner: number;
};

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
