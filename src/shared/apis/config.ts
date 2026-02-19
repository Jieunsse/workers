const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiTeamId = process.env.NEXT_PUBLIC_API_TEAM_ID;

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined.');
}
if (!apiTeamId) {
  throw new Error('NEXT_PUBLIC_API_TEAM_ID is not defined.');
}

export const BASE_URL = apiBaseUrl;
export const TEAM_ID = apiTeamId;
