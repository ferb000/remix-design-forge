export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fields = {
  projects: [
    "title",
    "category",
    "architect",
    "location",
    "year",
    "description",
    "image",
    "badge",
    "aspectRatio",
    "pipeline",
  ],
  clients: ["name", "subtitle", "logoUrl"],
  inquiries: ["name", "email", "message"],
  bookings: [
    "serviceId",
    "serviceName",
    "date",
    "time",
    "name",
    "email",
    "phone",
    "role",
    "notes",
    "projectName",
    "firmName",
    "location",
    "budget",
    "timeline",
  ],
};
const required = {
  projects: [
    "title",
    "category",
    "architect",
    "location",
    "year",
    "description",
    "image",
  ],
  clients: ["name"],
  inquiries: ["name", "email", "message"],
  bookings: ["serviceId", "serviceName", "date", "time", "name", "email"],
};
export function validate(kind, input, partial = false) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new ApiError(400, "A JSON object is required.");
  const output = {};
  for (const key of fields[kind]) {
    if (input[key] === undefined) continue;
    const limit = ["description", "message", "notes"].includes(key)
      ? 20000
      : 2048;
    if (typeof input[key] !== "string" || input[key].length > limit)
      throw new ApiError(400, `Invalid ${key}.`);
    output[key] = input[key].trim();
  }
  for (const key of required[kind]) {
    if ((!partial || key in output) && !output[key])
      throw new ApiError(400, `${key} is required.`);
  }
  if (
    output.category &&
    !["still-images", "animations", "vr", "360-panoramas"].includes(
      output.category,
    )
  )
    throw new ApiError(400, "Invalid project category.");
  if (output.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(output.email))
    throw new ApiError(400, "Enter a valid email address.");
  for (const key of ["image", "logoUrl"]) {
    if (
      output[key] &&
      !/^https?:\/\//i.test(output[key]) &&
      !/^\/(uploads|assets)\/[a-zA-Z0-9_.-]+$/.test(output[key])
    )
      throw new ApiError(400, `Invalid ${key} URL.`);
  }
  if (
    kind === "bookings" &&
    output.date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(output.date) ||
      Number.isNaN(Date.parse(output.date)))
  )
    throw new ApiError(400, "Invalid consultation date.");
  return output;
}
