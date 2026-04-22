const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value) =>
  typeof value === "string" && EMAIL_RE.test(value.trim());

export const isWithinLength = (value, max) =>
  typeof value === "string" && value.length <= max;

export const toIdString = (value) => String(value);

export const normalizeIds = (ids) =>
  Array.isArray(ids) ? [...new Set(ids.map(toIdString))] : [];

export const buildTaskUrl = (boardId) => {
  const base = process.env.FRONTEND_URL;
  return base ? `${base}/boards/${toIdString(boardId)}` : "";
};
