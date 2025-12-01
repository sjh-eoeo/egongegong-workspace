# 데이터 흐름 및 워크플로우 문서

## 📊 데이터 구조

### Firestore Collections
```
├── projects/           # 캠페인/프로젝트
├── influencers/        # 크리에이터 (프로젝트별)
├── creators/           # 크리에이터 풀 (전체)
├── brands/             # 브랜드
└── users/              # 사용자 (관리자/매니저)
```

## 🔄 워크플로우

### 인플루언서 상태 흐름
```
Discovery → Contacted → Negotiating → Approved → Shipped → Content Live → Payment Pending → Paid
```

| 상태 | 설명 | 트리거 |
|------|------|--------|
| Discovery | 발굴 단계 | 크리에이터 풀에서 추가 |
| Contacted | 연락 완료 | 이메일/DM 발송 |
| Negotiating | 협상 중 | 조건 협의 진행 |
| Approved | 승인됨 | 계약 조건 합의 |
| Shipped | 배송됨 | 제품 발송 |
| Content Live | 콘텐츠 라이브 | 영상 게시 확인 |
| Payment Pending | 정산 대기 | 정산 요청 |
| Paid | 정산 완료 | 송금 완료 |

## 📡 데이터 흐름

### 1. 읽기 (Real-time)
```
Firestore → onSnapshot → useCollection Hook → Component State → UI Render
```

**Hooks:**
- `useProjects()` - 프로젝트 목록
- `useInfluencers(projectId?)` - 인플루언서 (프로젝트 필터 옵션)
- `useBrands()` - 브랜드 목록
- `useUsers()` - 사용자 목록

### 2. 쓰기 (Mutations)
```
UI Action → Firestore Service → Firestore → onSnapshot → Auto-sync
```

**Services (lib/firebase/firestore.ts):**
- `createProject()`, `updateProject()`, `deleteProject()`
- `createInfluencer()`, `updateInfluencer()`, `deleteInfluencer()`
- `updateInfluencerStatus()` - 상태 변경
- `advanceInfluencerStatus()` - 다음 단계로 진행
- `processPayment()` - 결제 처리 (상태 + 예산 업데이트)
- `addInfluencersToProject()` - 크리에이터 풀 → 프로젝트 배정
- `updateContract()`, `updateLogistics()` - 세부 정보 업데이트

## 🖥️ 페이지별 데이터 사용

### /projects (캠페인 목록)
```tsx
const { data: projects, loading } = useProjects();
// 프로젝트 목록 표시, 클릭 시 상세 페이지 이동
```

### /projects/[id] (캠페인 대시보드)
```tsx
const { data: projects } = useProjects();
const { data: influencers } = useInfluencers(projectId);
// 프로젝트 정보 + 해당 프로젝트의 인플루언서 목록
// 탭: Negotiation / Performance / Finance / Settings
```

### /creators (크리에이터 풀)
```tsx
const { data: influencers, loading } = useInfluencers();
// 전체 크리에이터 목록 (필터/검색/정렬)
```

### /finance (정산 HQ)
```tsx
const { data: influencers } = useInfluencers();
const { data: projects } = useProjects();
// PaymentPending 상태인 인플루언서 + 전체 예산/지출 현황
```

### /reports (리포트)
```tsx
const { data: projects } = useProjects();
const { data: influencers } = useInfluencers();
// 대시보드 메트릭 계산 및 차트 표시
```

### /settings (설정)
```tsx
const { data: brands } = useBrands();
const { data: users } = useUsers();
// 브랜드/사용자 관리
```

## ✅ 데이터 검증 체크리스트

- [x] Firestore 연결 확인
- [x] Real-time 구독 (onSnapshot) 작동
- [x] 프로젝트 목록 로딩
- [x] 인플루언서 목록 로딩
- [x] 프로젝트별 필터링
- [x] Loading/Empty 상태 처리
- [x] TypeScript 타입 안전성
- [x] Firestore CRUD 서비스
- [x] 워크플로우 상태 전환 함수

## 🔧 필요한 추가 작업

1. **UI에 쓰기 작업 연결**
   - 버튼 클릭 → Firestore 서비스 호출
   - 예: "Pay" 버튼 → `processPayment()` 호출

2. **에러 핸들링**
   - try-catch로 Firestore 작업 감싸기
   - Toast 알림으로 결과 표시

3. **Optimistic Updates**
   - 즉각적인 UI 업데이트 후 Firestore 동기화

4. **데이터 유효성 검증**
   - Zod 스키마로 입력값 검증
