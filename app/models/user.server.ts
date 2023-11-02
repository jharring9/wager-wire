import arc from "@architect/functions";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

/**
 * A User is a person who has an account on WagerWire.
 */
export type User = {
  id: string;
  email: string;
  name: string;
  totalProfit: number;
  rankingType: "PUBLIC" | "PRIVATE";
};

/**
 * A Password is a hashed password for a User.
 */
export type Password = { password: string };

/**
 * Get a User by their ID.
 * @param id The ID of the User to get.
 */
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

/**
 * Get a User's hashed password by their email.
 * @param email The email of the User to get.
 */
async function getUserPasswordByEmail(email: User["email"]) {
  const db = await arc.tables();
  const result = await db.password.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": email },
  });

  const [record] = result.Items;

  if (record) return { hash: record.password };
  return null;
}

/**
 * Get the top 25 Users by total profit, descending.
 */
export async function getTop25UsersByProfit(): Promise<Array<User>> {
  const db = await arc.tables();

  const usersResult = await db.user.query({
    IndexName: "byTotalProfit",
    KeyConditionExpression: "rankingType = :rankingValue",
    ExpressionAttributeValues: { ":rankingValue": "PUBLIC" },
    ScanIndexForward: false,
    Limit: 25,
  });

  return usersResult.Items.map((user) => ({
    id: user.pk,
    email: user.email,
    name: user.name,
    totalProfit: user.totalProfit,
    rankingType: user.rankingType,
  }));
}

/**
 * Create a new User when a user registers.
 * @param name The name of the User.
 * @param email The email of the User.
 * @param password The password of the User.
 */
export async function createUser(
  name: User["name"],
  email: User["email"],
  password: Password["password"],
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await arc.tables();
  await db.password.put({
    pk: email,
    password: hashedPassword,
  });

  await db.user.put({
    pk: email,
    name,
    email,
    totalProfit: 0,
    rankingType: "PUBLIC",
  });

  const user = await getUserById(email);
  invariant(user, `User not found after being created. This should not happen`);

  return user;
}

/**
 * Verify a user's login attempt.
 * @param email The email entered.
 * @param password The password entered.
 */
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

  return getUserById(email);
}

export async function updateName(id: User["id"], name: User["name"]) {
  const user = await getUserById(id);
  invariant(user, "User not found in database");

  const db = await arc.tables();

  await db.user.put({
    pk: user.id,
    email: user.email,
    name: name,
    totalProfit: user.totalProfit,
    rankingType: user.rankingType,
  });

  return true;
}

export async function updatePassword(
  id: User["id"],
  password: Password["password"],
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await arc.tables();
  await db.password.put({
    pk: id,
    password: hashedPassword,
  });
  return true;
}
