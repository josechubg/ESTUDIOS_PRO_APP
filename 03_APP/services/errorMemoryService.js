export function createError({ area, text, status = "pendiente" }) {
  return {
    area,
    text,
    status,
    createdAt: new Date().toISOString(),
  };
}

export function getVisibleErrors(errors, { area, subject }) {
  const visible = errors.filter(
    (error) => error.area === area || error.area === subject || error.area.startsWith(`${subject} ·`)
  );

  return visible.length ? visible : errors;
}

export function addError(errors, error) {
  return [error, ...errors];
}
