import arc from "@architect/functions";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

export type User = {
  id: `email#${string}`;
  email: string;
  name: string;
  totalProfit: number;
  rankingType: "PUBLIC" | "PRIVATE";
};

export type Password = { password: string };

export async function getUserById(id: User["id"]): Promise<User | null> {
  const db = await arc.tables();
  const result = await db.user.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": id },
  });

  const [record] = result.Items;
  if (record)
    return {
      id: record.pk,
      email: record.email,
      name: record.name,
      totalProfit: record.totalProfit,
      rankingType: record.rankingType,
    };
  return null;
}

export async function getUserByEmail(email: User["email"]) {
  return getUserById(`email#${email}`);
}

async function getUserPasswordByEmail(email: User["email"]) {
  const db = await arc.tables();
  const result = await db.password.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": `email#${email}` },
  });

  const [record] = result.Items;

  if (record) return { hash: record.password };
  return null;
}

export async function getTop25UsersByProfit(): Promise<Array<User>> {
  const db = await arc.tables();

  const usersResult = await db.user.query({
    IndexName: "ByTotalProfit",
    KeyConditionExpression: "rankingType = :rankingValue",
    ExpressionAttributeValues: { ":rankingValue": "PUBLIC" },
    ScanIndexForward: false,
    Limit: 25,
  });

  return usersResult.Items;
}

export async function createUser(
  name: User["name"],
  email: User["email"],
  password: Password["password"],
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await arc.tables();
  await db.password.put({
    pk: `email#${email}`,
    password: hashedPassword,
  });

  await db.user.put({
    pk: `email#${email}`,
    name,
    email,
    totalProfit: 0,
    rankingType: "PUBLIC",
  });

  const user = await getUserByEmail(email);
  invariant(user, `User not found after being created. This should not happen`);

  return user;
}

export async function verifyLogin(
  email: User["email"],
  password: Password["password"],
) {
  const userPassword = await getUserPasswordByEmail(email);

  if (!userPassword) {
    return undefined;
  }

  const isValid = await bcrypt.compare(password, userPassword.hash);
  if (!isValid) {
    return undefined;
  }

  return getUserByEmail(email);
}
