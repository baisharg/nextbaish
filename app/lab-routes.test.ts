import { describe, expect, test } from "bun:test";
import { publicPathname } from "./lab-routes";

describe("publicPathname", () => {
  test("maps lab paths back to the main routes", () => {
    expect(publicPathname("/en/lab")).toBe("/en");
    expect(publicPathname("/es/lab/about")).toBe("/es/about");
    expect(publicPathname("/es/lab/programs")).toBe("/es/activities");
    expect(publicPathname("/en/lab/contact/")).toBe("/en/contact");
  });

  test("leaves other paths alone", () => {
    expect(publicPathname("/en/about")).toBe("/en/about");
    expect(publicPathname("/es/privacy-policy")).toBe("/es/privacy-policy");
    expect(publicPathname("/en/lab/unknown")).toBe("/en/lab/unknown");
    expect(publicPathname("/en/activities/reading")).toBe("/en/activities/reading");
  });
});
