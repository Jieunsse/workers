// TODO: 팀원 코드 BFF 마이그레이션 완료 후 주석 해제
// import 'server-only';

// 빌드 타임이 아닌 런타임에 환경변수를 검증한다.
// 모듈 최상위에서 즉시 throw하면 Next.js 빌드의 page data collecting 단계에서
// 환경변수가 주입되기 전에 에러가 발생하기 때문이다.
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined.`);
  }
  return value;
}

export function getBaseUrl(): string {
  return getEnv('API_BASE_URL');
}

export function getTeamId(): string {
  return getEnv('API_TEAM_ID');
}

// 하위 호환성을 위한 getter (기존 코드에서 BASE_URL, TEAM_ID를 직접 참조하는 경우)
// TODO: 팀원 BFF 마이그레이션 완료 후 제거
export const BASE_URL = process.env.API_BASE_URL ?? '';
export const TEAM_ID = process.env.API_TEAM_ID ?? '';
