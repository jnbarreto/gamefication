import { getCalendarDay } from "./getCalendarDay.js";

describe("getCalendarDay", () => {
  it("formats date in the configured timezone", () => {
    const date = new Date("2026-09-14T02:30:00.000Z");

    expect(getCalendarDay(date, "America/Sao_Paulo")).toBe("2026-09-13");
    expect(getCalendarDay(date, "UTC")).toBe("2026-09-14");
  });
});
