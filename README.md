##  🌏배포주소

https://coworkers-twenty.vercel.app/

---

## 🛠️ 기술 스택

- **Next.js** (App Router)
- **TypeScript**
- **CSS Modules**
- **Axios**
- **Zod**
- **ESLint (Flat Config) + Prettier**
- **Husky + Commitlint**
- **GitHub Actions (CI)**

---

## 🏗️ 프로젝트 구조

```txt
src/
├─ app/                     # Next.js App Router 엔트리
│  └─ (root)/               # 홈 페이지 라우트 그룹
├─ assets/                  # 정적 에셋
│  ├─ buttons/
│  ├─ icons/
│  ├─ logos/
├─ components/              # 재사용 UI 컴포넌트
└─ shared/                  # 도메인과 무관한 공통 코드
   ├─ apis/                 # Fetch 함수
   ├─ constants/            # 전역 상수
   ├─ styles/               # 공통 스타일 유틸
   ├─ types/                # 공통 타입
   └─ utils/                # 순수 유틸 함수
```
