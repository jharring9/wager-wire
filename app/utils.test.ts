import { getNFLWeek, validateEmail } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});

test("getNFLWeek returns the correct week", () => {
  expect(getNFLWeek(new Date("2023-09-05"))).toBe(1);
  expect(getNFLWeek(new Date("2023-09-11"))).toBe(1);
  expect(getNFLWeek(new Date("2023-09-12"))).toBe(2);
  expect(getNFLWeek(new Date("2023-09-18"))).toBe(2);
  expect(getNFLWeek(new Date("2023-09-19"))).toBe(3);
  expect(getNFLWeek(new Date("2023-09-25"))).toBe(3);
  expect(getNFLWeek(new Date("2023-09-26"))).toBe(4);
  expect(getNFLWeek(new Date("2023-12-26"))).toBe(17);
});