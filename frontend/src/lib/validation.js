export function validateRequired(value, label) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required`;
  }
  return '';
}

export function validateNumber(value, label, { min, max, integer = false } = {}) {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required`;
  }

  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return `${label} must be a valid number`;
  if (integer && !Number.isInteger(number)) return `${label} must be a whole number`;
  if (min !== undefined && number < min) return `${label} must be at least ${min}`;
  if (max !== undefined && number > max) return `${label} cannot exceed ${max}`;
  return '';
}

export function validateEmail(value, label = 'Email') {
  if (!value) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : `${label} must be a valid email address`;
}

export function validateFields(values, rules) {
  return Object.entries(rules).reduce((errors, [field, validators]) => {
    const checks = Array.isArray(validators) ? validators : [validators];
    const message = checks.map(validate => validate(values[field])).find(Boolean);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export function getApiFieldErrors(error) {
  return (error?.errors || []).reduce((errors, item) => {
    if (item?.field) errors[item.field] = item.message;
    return errors;
  }, {});
}

export function getApiErrorMessage(error, fallback) {
  return error?.message || error?.error || fallback;
}
