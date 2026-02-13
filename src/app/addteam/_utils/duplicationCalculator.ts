export function normalizeTeamName(name: string) {
  return name.trim();
}

function normalizeForCompare(name: string) {
  return normalizeTeamName(name).toLowerCase();
}

export function isDuplicated(existingNames: string[], inputName: string) {
  const normalizedInput = normalizeForCompare(inputName);
  return existingNames.some((name) => normalizeForCompare(name) === normalizedInput);
}
