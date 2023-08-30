import arc from "@architect/functions";

export type Game = {
  id: string;
  team1: string;
  team2: string;
  team1Spread: number;
  team2Spread: number;
  date: string;
};

export async function getCurrentGames(): Promise<Array<Game>> {
  const db = await arc.tables();

  const currentGames = await db.current.scan({});
  console.log("current games", currentGames.Items);

  return currentGames.Items;
}