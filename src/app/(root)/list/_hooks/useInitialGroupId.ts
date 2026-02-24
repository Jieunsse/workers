import { useSearchParams } from 'next/navigation';

// URL 쿼리 파라미터 groupId에서 초기 활성 그룹 ID를 읽어오는 훅
export function useInitialGroupId(): number | undefined {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get('groupId'));
  return id > 0 ? id : undefined;
}
