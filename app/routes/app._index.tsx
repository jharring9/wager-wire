import { redirect } from "@remix-run/node";

export const loader = async () => redirect("/app/user/me");
