import { ApiError } from "./validation.js";

export const TIMES = [
  "10:00 GMT",
  "11:30 GMT",
  "14:00 GMT",
  "16:00 GMT",
  "17:30 GMT",
  "19:00 GMT",
];
export const DURATION_MINUTES = 30;
export const HORIZON_DAYS = 30;
const DAY = 86400000;
// Accra uses GMT (UTC+00:00) year round. Legacy CET intervals retain their original offset.
export function interval(date, time) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date || "") ||
    !/^\d{2}:\d{2} (?:GMT|CET)$/.test(time || "")
  )
    throw new ApiError(400, "Choose a valid consultation date and GMT time.");
  const calendar = new Date(date + "T00:00:00Z");
  if (
    !Number.isFinite(calendar.getTime()) ||
    calendar.toISOString().slice(0, 10) !== date
  )
    throw new ApiError(400, "Invalid consultation date.");
  const startsAt = new Date(`${date}T${time.slice(0, 5)}:00${time.endsWith("CET") ? "+01:00" : "+00:00"}`);
  if (!Number.isFinite(startsAt.getTime()))
    throw new ApiError(400, "Invalid consultation time.");
  return {
    startsAt: startsAt.toISOString(),
    endsAt: new Date(
      startsAt.getTime() + DURATION_MINUTES * 60000,
    ).toISOString(),
  };
}
export function schedule(now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  const dates = [];
  for (let i = 0; i < HORIZON_DAYS; i++) {
    const day = new Date(Date.parse(today + "T00:00:00Z") + i * DAY);
    if ([0, 6].includes(day.getUTCDay())) continue;
    const date = day.toISOString().slice(0, 10);
    dates.push({
      date,
      slots: TIMES.map((time) => ({ time, ...interval(date, time) })).filter(
        (slot) => Date.parse(slot.startsAt) > now,
      ),
    });
  }
  return dates.filter((day) => day.slots.length);
}
export function validateSlot(date, time, now) {
  const slot = schedule(now)
    .find((day) => day.date === date)
    ?.slots.find((slot) => slot.time === time);
  if (!slot)
    throw new ApiError(
      400,
      "Choose an upcoming available weekday slot within the next 30 days.",
    );
  return slot;
}
export async function availability(pool, now) {
  const dates = schedule(now);
  const result = await pool.query(
    "SELECT lower(reserved_range) AS start, upper(reserved_range) AS finish FROM bookings WHERE data->>'status' IN ('pending','confirmed') AND reserved_range && tstzrange($1,$2,'[)')",
    [new Date(now), new Date(now + (HORIZON_DAYS + 1) * DAY)],
  );
  return {
    timeZone: "Africa/Accra (GMT, UTC+00:00)",
    durationMinutes: DURATION_MINUTES,
    dates: dates.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => ({
        ...slot,
        available: !result.rows.some(
          (row) =>
            Date.parse(slot.startsAt) < new Date(row.finish).getTime() &&
            Date.parse(slot.endsAt) > new Date(row.start).getTime(),
        ),
      })),
    })),
  };
}
