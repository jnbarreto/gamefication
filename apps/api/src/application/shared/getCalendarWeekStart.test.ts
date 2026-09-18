import { getCalendarWeekStart } from "./getCalendarWeekStart.js";

describe("getCalendarWeekStart", () => {
  it("returns Monday for a date in the same week", () => {
    const wednesday = new Date("2026-09-16T12:00:00.000Z");

    expect(getCalendarWeekStart(wednesday, "UTC")).toBe("2026-09-14");
  });

  it("returns the same day when the date is Monday", () => {
    const monday = new Date("2026-09-14T12:00:00.000Z");

    expect(getCalendarWeekStart(monday, "UTC")).toBe("2026-09-14");
  });

  it("rolls back to Monday when the date is Sunday", () => {
    const sunday = new Date("2026-09-20T12:00:00.000Z");

    expect(getCalendarWeekStart(sunday, "UTC")).toBe("2026-09-14");
  });

  it("respects the configured timezone", () => {
    const date = new Date("2026-09-14T02:30:00.000Z");

    expect(getCalendarWeekStart(date, "America/Sao_Paulo")).toBe("2026-09-07");
    expect(getCalendarWeekStart(date, "UTC")).toBe("2026-09-14");
  });
});
