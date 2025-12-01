# 이공이공 (Egongegong) - 개발 가이드 & AI 인스트럭션 문서

> **TikTok Seeding OS** - 인플루언서 마케팅 캠페인 통합 관리 플랫폼

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [프로젝트 구조](#-프로젝트-구조)
4. [Firebase 인프라](#-firebase-인프라)
5. [데이터베이스 스키마](#-데이터베이스-스키마)
6. [API 라우트](#-api-라우트)
7. [외부 서비스 연동](#-외부-서비스-연동)
8. [AI 서비스 (Gemini)](#-ai-서비스-gemini)
9. [상태 관리](#-상태-관리)
10. [인증 시스템](#-인증-시스템)
11. [환경 변수 설정](#-환경-변수-설정)
12. [개발 가이드라인](#-개발-가이드라인)
13. [AI 코딩 어시스턴트 인스트럭션](#-ai-코딩-어시스턴트-인스트럭션)
14. [배포 가이드](#-배포-가이드)

---

## 🎯 프로젝트 개요

### 목적
인플루언서 마케팅 에이전시와 브랜드가 대규모 시딩(제품 협찬) 캠페인을 효율적으로 관리하고, 크리에이터와의 협상부터 정산까지의 전 과정을 통합 관리하기 위한 엔터프라이즈급 대시보드.

### 핵심 기능
- **캠페인 관리**: 프로젝트/캠페인 생성 및 진행 상황 트래킹
- **크리에이터 풀**: 인플루언서 DB 관리 및 프로젝트 배정
- **협상 워크플로우**: 상태 기반 워크플로우 (Discovery → Paid)
- **정산 관리**: 결제 처리 및 예산 트래킹
- **AI 협상 분석**: Gemini AI를 활용한 협상 전략 제안
- **외부 연동**: Airtable, TikTok API, Zendesk 통합

---

## 🛠 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 16.x | React 프레임워크 (App Router) |
| **React** | 19.x | UI 라이브러리 |
| **TypeScript** | 5.x | 타입 안전성 |
| **Tailwind CSS** | 4.x | 스타일링 |
| **HeroUI** | 2.x | UI 컴포넌트 라이브러리 |
| **Framer Motion** | 12.x | 애니메이션 |
| **Recharts** | 2.x | 차트/데이터 시각화 |
| **TanStack Table** | 8.x | 데이터 테이블 |
| **Lucide React** | - | 아이콘 |

### Backend / Infrastructure
| 기술 | 용도 |
|------|------|
| **Firebase Auth** | 사용자 인증 (Google OAuth) |
| **Firebase Firestore** | NoSQL 데이터베이스 |
| **Firebase Storage** | 파일 저장소 |
| **Firebase Analytics** | 사용자 분석 |
| **Next.js API Routes** | 서버사이드 API |

### 상태 관리
| 기술 | 용도 |
|------|------|
| **Zustand** | 글로벌 상태 관리 |
| **React Hooks** | 로컬 상태 관리 |

### AI / 외부 서비스
| 서비스 | 용도 |
|--------|------|
| **Google Gemini** | AI 협상 분석 |
| **Airtable** | 인플루언서 데이터 동기화 |
| **TokAPI (RapidAPI)** | TikTok 크리에이터 메트릭스 |
| **Zendesk** | 이메일 아웃리치 |

---

## 📁 프로젝트 구조

```
egongegong-next/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 메인 페이지 (리다이렉트)
│   ├── providers.tsx             # 전역 Provider 설정
│   ├── globals.css               # 글로벌 스타일
│   │
│   ├── api/                      # API 라우트
│   │   ├── airtable/route.ts     # Airtable CRUD API
│   │   ├── tiktok/route.ts       # TikTok 메트릭스 API
│   │   ├── health/               # 헬스체크
│   │   ├── sync/                 # 데이터 동기화
│   │   └── test-db/              # DB 테스트
│   │
│   ├── login/page.tsx            # 로그인 페이지
│   ├── pending/page.tsx          # 승인 대기 페이지
│   ├── projects/                 # 프로젝트/캠페인
│   │   ├── page.tsx              # 프로젝트 목록
│   │   └── [id]/page.tsx         # 프로젝트 상세
│   ├── creators/page.tsx         # 크리에이터 풀
│   ├── finance/page.tsx          # 정산 HQ
│   ├── outreach/page.tsx         # 아웃리치 관리
│   ├── reports/page.tsx          # 리포트/대시보드
│   └── settings/page.tsx         # 설정
│
├── components/                   # React 컴포넌트
│   ├── AuthProvider.tsx          # 인증 Provider
│   ├── Toast.tsx                 # 토스트 알림
│   ├── layout/Layout.tsx         # 메인 레이아웃
│   ├── ui/                       # 기본 UI 컴포넌트
│   ├── modals/                   # 모달 컴포넌트
│   ├── projects/                 # 프로젝트 관련
│   ├── creators/                 # 크리에이터 관련
│   ├── finance/                  # 정산 관련
│   ├── outreach/                 # 아웃리치 관련
│   ├── reports/                  # 리포트 관련
│   └── settings/                 # 설정 관련
│
├── lib/                          # 라이브러리/유틸리티
│   ├── constants.ts              # 상수 정의
│   ├── utils.ts                  # 유틸리티 함수
│   └── firebase/                 # Firebase 설정
│       ├── config.ts             # Firebase 초기화
│       └── firestore.ts          # Firestore CRUD 함수
│
├── hooks/                        # 커스텀 React Hooks
│   ├── useCollection.ts          # Firestore 실시간 구독
│   ├── useAirtableSync.ts        # Airtable 동기화
│   └── useTheme.ts               # 테마 관리
│
├── stores/                       # Zustand 스토어
│   ├── useAuthStore.ts           # 인증 상태
│   ├── useBrandStore.ts          # 브랜드 상태
│   └── useProjectStore.ts        # 프로젝트 상태
│
├── services/                     # 외부 서비스 연동
│   ├── airtableService.ts        # Airtable API
│   ├── geminiService.ts          # Google Gemini AI
│   ├── tokApiService.ts          # TikTok API
│   └── zendeskService.ts         # Zendesk API
│
├── types.ts                      # TypeScript 타입 정의
├── docs/DATA_FLOW.md             # 데이터 흐름 문서
│
├── next.config.ts                # Next.js 설정
├── tailwind.config.ts            # Tailwind CSS 설정
├── tsconfig.json                 # TypeScript 설정
└── package.json                  # 의존성 관리
```

---

## 🔥 Firebase 인프라

### 프로젝트 정보
```
Project ID: egongegong-eoeo
Region: asia-northeast3 (서울)
```

### Firebase 서비스 구성

#### 1. Firebase Authentication
- **인증 방식**: Google OAuth 2.0
- **설정**: `same-origin-allow-popups` COOP 헤더 (팝업 인증 지원)

```typescript
// lib/firebase/config.ts
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
```

#### 2. Cloud Firestore
- **모드**: Production
- **위치**: asia-northeast3
- **실시간 구독**: `onSnapshot` 사용

```typescript
// lib/firebase/config.ts
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
```

#### 3. Firebase Storage
- **용도**: 계약서, 송금 증빙, 영상 스크린샷 저장

```typescript
// lib/firebase/config.ts
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
```

#### 4. Firebase Analytics
- **용도**: 사용자 행동 분석
- **주의**: 클라이언트 사이드에서만 동작

```typescript
// 브라우저에서만 로드
export const getAnalyticsInstance = async () => {
  if (typeof window !== 'undefined') {
    const { getAnalytics } = await import("firebase/analytics");
    return getAnalytics(app);
  }
  return null;
};
```

### Firebase 보안 규칙 (권장)
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // 사용자 문서는 본인만 수정 가능
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Admin만 사용자 승인 가능
    match /users/{userId} {
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📊 데이터베이스 스키마

### Firestore Collections

#### `projects` - 캠페인/프로젝트
```typescript
interface Project {
  id: string;
  title: string;
  brand: string;
  status: 'Active' | 'Completed' | 'Draft';
  budget: number;
  spent: number;
  description: string;
  startDate: string;
  managers: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `influencers` - 인플루언서/크리에이터
```typescript
interface Influencer {
  id: string;
  projectId?: string;              // 프로젝트 배정 시
  handle: string;                  // @username
  name: string;
  email: string;
  followerCount: number;
  country: string;
  categories?: string[];           // 다중 카테고리
  status: InfluencerStatus;        // 워크플로우 상태
  
  // TikTok 메트릭스
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    avgViewsPerVideo?: number;
  };
  
  // 계약 정보
  contract: {
    totalAmount: number;
    currency: string;
    videoCount: number;
    paymentMethod: 'Wise' | 'PayPal' | 'Bank Transfer' | 'Unselected';
    paymentSchedule: string;
    platform: 'TikTok' | 'Instagram' | 'YouTube' | 'X (Twitter)';
    status: 'Draft' | 'Sent' | 'Signed';
    milestones: PaymentMilestone[];
    // ...
  };
  
  // 배송 정보
  logistics: {
    shippingAddress?: string;
    carrier?: string;
    trackingNumber?: string;
    shippedDate?: string;
    status: 'Pending' | 'Shipped' | 'Delivered';
  };
  
  // 콘텐츠 상태
  content: {
    draftLink?: string;
    isApproved: boolean;
    postedVideos: PostedVideo[];
    status: 'Waiting for Draft' | 'Draft Review' | 'Approved' | 'Live';
  };
  
  // 결제 정보
  agreedAmount: number;
  currency: string;
  paymentStatus: 'Unpaid' | 'Processing' | 'Paid';
  paymentRecord?: PaymentRecord;
  
  // 협상 히스토리
  history: ChatMessage[];
  notes: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `brands` - 브랜드
```typescript
interface Brand {
  id: string;
  name: string;
  logo?: string;
  zendeskAccountId?: string;
  createdAt: Timestamp;
}
```

#### `users` - 사용자
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Pending' | 'Approved' | 'Declined';
  avatar?: string;
  createdAt: Timestamp;
}
```

#### `zendeskAccounts` - Zendesk 계정
```typescript
interface ZendeskAccount {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  apiToken: string;  // 암호화 권장
  isActive: boolean;
  createdAt: Timestamp;
}
```

#### `categories` - 크리에이터 카테고리
```typescript
interface Category {
  id: string;
  name: string;
  createdAt: Timestamp;
}
```

### 인플루언서 상태 워크플로우
```
Discovery → Contacted → Negotiating → Contracted → Approved → Shipped → Content Live → Payment Pending → Paid
```

| 상태 | 설명 | 트리거 |
|------|------|--------|
| Discovery | 발굴 단계 | 크리에이터 풀에서 추가 |
| Contacted | 연락 완료 | 이메일/DM 발송 |
| Negotiating | 협상 중 | 조건 협의 진행 |
| Contracted | 계약 체결 | 계약서 서명 |
| Approved | 승인됨 | 내부 승인 완료 |
| Shipped | 배송됨 | 제품 발송 |
| Content Live | 콘텐츠 라이브 | 영상 게시 확인 |
| Payment Pending | 정산 대기 | 정산 요청 |
| Paid | 정산 완료 | 송금 완료 |

---

## 🌐 API 라우트

### `/api/airtable`
Airtable 인플루언서 데이터 CRUD

```typescript
// GET - 인플루언서 조회
GET /api/airtable?limit=10&account=@username

// POST - 생성 (단일/배치)
POST /api/airtable
Body: { account: string, email: string, ... }
// 또는
Body: { records: [...] }  // 배치 생성

// PATCH - 수정 (단일/배치)
PATCH /api/airtable
Body: { id: string, data: {...} }
// 또는
Body: { records: [{ id: string, data: {...} }, ...] }

// DELETE - 삭제 (단일/배치)
DELETE /api/airtable
Body: { id: string }
// 또는
Body: { ids: [...] }
```

### `/api/tiktok`
TikTok 크리에이터 메트릭스 조회

```typescript
// GET - 크리에이터 메트릭스
GET /api/tiktok?username=@creator_handle

// Response
{
  status: 'ok',
  username: '@creator_handle',
  user: {
    id: string,
    handle: string,
    name: string,
    avatar: string,
    verified: boolean,
    bio: string
  },
  stats: {
    followers: number,
    following: number,
    totalLikes: number,
    videoCount: number
  },
  metrics: {
    avgViews: number,
    avgLikes: number,
    avgComments: number,
    avgShares: number,
    engagementRate: number
  }
}
```

### `/api/health`
서버 헬스체크

### `/api/sync/airtable`
Airtable ↔ Firestore 동기화

---

## 🔗 외부 서비스 연동

### 1. Airtable Service
**파일**: `services/airtableService.ts`

```typescript
// 주요 함수
fetchAllInfluencers(): Promise<AirtableInfluencer[]>
fetchInfluencersByAccounts(accounts: string[]): Promise<AirtableInfluencer[]>
createInfluencerInAirtable(data: AirtableInfluencerInput): Promise<AirtableInfluencer>
updateInfluencerInAirtable(id: string, data: Partial<AirtableInfluencerInput>): Promise<void>
deleteInfluencerFromAirtable(id: string): Promise<void>
batchCreateInfluencersInAirtable(records: AirtableInfluencerInput[]): Promise<AirtableInfluencer[]>
batchUpdateInfluencersInAirtable(updates: {id: string, data: Partial}[]): Promise<void>
```

**Airtable 필드 매핑**:
| Airtable 필드 | 앱 필드 |
|--------------|---------|
| Influencer Account | account |
| TIKTOK PROFILE LINK | tiktokProfileLink |
| Email | email |
| Followers | followers |
| MAX Views | maxViews |
| 5_average | averageViews5 |
| 20_median | medianViews20 |
| 20_average | averageViews20 |
| Followers 분포 | followersDistribution |
| Collab Count | collabCount |
| Average Rate | averageRate |

### 2. TokAPI Service (TikTok)
**파일**: `services/tokApiService.ts`

```typescript
// RapidAPI - TikTok Scraper7
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';

// 주요 함수
fetchTikTokUser(username: string): Promise<TikTokUserInfo | null>
fetchUserVideos(username: string, count?: number): Promise<TikTokVideoInfo[]>
fetchCreatorMetrics(username: string): Promise<TikTokMetricsResult | null>
```

**반환 메트릭스**:
- 팔로워 수, 팔로잉 수, 총 좋아요
- 평균 조회수, 평균 좋아요, 평균 댓글, 평균 공유
- 인게이지먼트 레이트

### 3. Zendesk Service
**파일**: `services/zendeskService.ts`

```typescript
// 멀티 브랜드 지원 (계정별 분리)
createTicket(accountId: string, data: TicketData): Promise<ZendeskTicket>
getTickets(accountId: string, filters?: TicketFilters): Promise<ZendeskTicket[]>
updateTicket(accountId: string, ticketId: number, data: Partial<TicketData>): Promise<void>
getMacros(accountId: string): Promise<ZendeskMacro[]>
searchUsers(accountId: string, email: string): Promise<ZendeskUser[]>
```

**인증**: Basic Auth (email/token)

---

## 🤖 AI 서비스 (Gemini)

### 구성
**파일**: `services/geminiService.ts`

```typescript
import { GoogleGenAI } from "@google/genai";

// Gemini 3 Pro Preview 사용
const model = "gemini-3-pro-preview";

// Thinking 모드 활성화 (딥 추론)
const config = {
  thinkingConfig: { thinkingBudget: 32768 }  // 최대 사고 예산
};
```

### AI 협상 분석 기능
```typescript
analyzeNegotiation(influencer: Influencer, messages: ChatMessage[]): Promise<string>
```

**입력 컨텍스트**:
- 인플루언서 정보 (핸들, 팔로워 수, 현재 상태)
- 제안/합의 금액
- 성과 메트릭스 (조회수, 인게이지먼트율)
- 협상 히스토리 (이메일/내부 노트)

**AI 출력**:
1. 현재 상황 전략적 분석
2. 구체적인 다음 행동 추천
3. 바로 보낼 수 있는 응답 초안

### AI 프롬프트 구조
```
You are a Strategic Influencer Marketing Negotiator for a brand.
Analyze the following negotiation history with influencer {handle} ({followers} followers).

Current Status: {status}
Agreed/Proposed Amount: {amount} {currency}
Engagement Metrics: Views: {views}, ER: {engagementRate}%

Negotiation History:
{messages}

Your goal is to maximize ROI while maintaining a good relationship.

Provide:
1. A strategic analysis of the current situation.
2. A specific recommended next step (e.g., "Counter offer with $X", "Ask for usage rights", "Accept offer").
3. A draft response (if applicable) that the operator can send immediately.
```

---

## 🗃️ 상태 관리

### Zustand Stores

#### `useAuthStore`
```typescript
interface AuthState {
  user: User | null;           // Firebase Auth 사용자
  appUser: AppUser | null;     // Firestore 사용자 문서
  loading: boolean;
  setUser: (user: User | null) => void;
  setAppUser: (appUser: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  reset: () => void;
}
```

#### `useBrandStore`
```typescript
interface BrandState {
  selectedBrand: Brand | null;
  setSelectedBrand: (brand: Brand | null) => void;
}
```

### Custom Hooks

#### `useCollection` - 실시간 Firestore 구독
```typescript
// 범용 컬렉션 Hook
function useCollection<T>(collectionName: string, constraints?: QueryConstraint[])
  : { data: T[], loading: boolean, error: Error | null }

// 특화 Hooks
useProjects(): { data: Project[], loading, error }
useInfluencers(projectId?: string): { data: Influencer[], loading, error }
useBrands(): { data: Brand[], loading, error }
useCategories(): { data: Category[], loading, error }
useUsers(): { data: User[], loading, error }
```

---

## 🔐 인증 시스템

### 인증 플로우
```
1. 사용자가 Google 로그인 시도
2. Firebase Auth로 Google OAuth 처리
3. AuthProvider가 onAuthStateChanged 감지
4. Firestore에서 사용자 문서 조회
   - 있으면: appUser 상태 설정
   - 없으면: status='pending'으로 새 문서 생성
5. 상태에 따른 라우팅:
   - pending → /pending (승인 대기 페이지)
   - approved/active → / (메인 앱)
```

### AuthProvider 구현
```typescript
// components/AuthProvider.tsx
export function AuthProvider({ children }) {
  const { setUser, setAppUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setAppUser(userDocSnap.data() as AppUser);
        } else {
          // 새 사용자 생성 (pending 상태)
          const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'user',
            status: 'pending',
          };
          await setDoc(userDocRef, newUser);
          setAppUser(newUser);
        }
      } else {
        setUser(null);
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
```

### 사용자 권한 레벨
| 역할 | 권한 |
|------|------|
| Admin | 모든 기능 + 사용자 승인 |
| Manager | 프로젝트 관리 + 크리에이터 관리 |
| Viewer | 읽기 전용 |

---

## ⚙️ 환경 변수 설정

### `.env.local` 파일
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=egongegong-eoeo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=egongegong-eoeo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=egongegong-eoeo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1002249339676
NEXT_PUBLIC_FIREBASE_APP_ID=1:1002249339676:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BL2713R6WX

# Airtable Configuration
AIRTABLE_API_TOKEN=pat...
AIRTABLE_BASE_ID=appgQd2ROl1QfZKi3
AIRTABLE_TABLE_NAME=Influencers

# TikTok API (RapidAPI)
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 환경 변수 구분
- `NEXT_PUBLIC_*`: 클라이언트에 노출 (브라우저에서 사용)
- 접두사 없음: 서버 전용 (API 라우트에서만 사용)

---

## 📝 개발 가이드라인

### 코드 스타일
```typescript
// 컴포넌트 파일 구조
'use client';  // 클라이언트 컴포넌트 필수

import { ... } from 'react';
import { ... } from '@/lib/...';
import { ... } from '@/components/...';

interface Props { ... }

export function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  const [state, setState] = useState();
  
  // effects
  useEffect(() => { ... }, []);
  
  // handlers
  const handleClick = () => { ... };
  
  // render
  return ( ... );
}
```

### Firestore 작업 패턴
```typescript
// 읽기 - 실시간 구독 (권장)
const { data, loading, error } = useInfluencers(projectId);

// 쓰기 - 서비스 함수 사용
import { updateInfluencer, processPayment } from '@/lib/firebase/firestore';

const handleUpdate = async () => {
  try {
    await updateInfluencer(id, { status: 'Approved' });
    toast.success('업데이트 완료');
  } catch (error) {
    toast.error('업데이트 실패');
  }
};
```

### 에러 처리
```typescript
// API 라우트
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 컴포넌트
const handleAction = async () => {
  try {
    await someAsyncOperation();
  } catch (error) {
    console.error('Operation failed:', error);
    toast.error('작업 실패');
  }
};
```

### 파일 네이밍 규칙
| 타입 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ProjectCard.tsx` |
| 페이지 | kebab-case 폴더 | `app/projects/page.tsx` |
| Hook | camelCase (use prefix) | `useCollection.ts` |
| 서비스 | camelCase (Service suffix) | `airtableService.ts` |
| 타입 | PascalCase | `types.ts` 내 `interface Project` |
| 상수 | SCREAMING_SNAKE_CASE | `MOCK_BRANDS` |

---

## 🤖 AI 코딩 어시스턴트 인스트럭션

### 프로젝트 컨텍스트
```
이 프로젝트는 인플루언서 마케팅 캠페인 관리 플랫폼입니다.
- Next.js 16 (App Router) + React 19 + TypeScript
- Firebase (Auth, Firestore, Storage) 백엔드
- HeroUI + Tailwind CSS 스타일링
- Zustand 상태 관리
```

### 코드 생성 시 준수사항

#### 1. 클라이언트/서버 구분
```typescript
// 클라이언트 컴포넌트 (useState, useEffect 사용 시)
'use client';

// 서버 컴포넌트 (기본값, 데이터 페칭)
// 'use client' 없음
```

#### 2. Import 경로
```typescript
// @ alias 사용
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import type { Project } from '@/types';
```

#### 3. Firestore 작업
```typescript
// 읽기는 useCollection hook 사용
const { data: projects, loading } = useProjects();

// 쓰기는 lib/firebase/firestore.ts 함수 사용
await updateProject(id, { status: 'Completed' });
```

#### 4. 상태 관리
```typescript
// 전역 상태: Zustand
import { useAuthStore } from '@/stores/useAuthStore';
const { user, appUser } = useAuthStore();

// 서버 상태: useCollection (실시간 구독)
const { data } = useInfluencers();

// 로컬 상태: useState
const [isOpen, setIsOpen] = useState(false);
```

#### 5. UI 컴포넌트
```typescript
// HeroUI 우선 사용
import { Button, Modal, Input } from '@heroui/react';

// 아이콘은 Lucide
import { Plus, Search, Settings } from 'lucide-react';
```

#### 6. 스타일링
```typescript
// Tailwind CSS 클래스 사용
<div className="flex items-center gap-4 p-4 bg-background">

// 다크 모드 지원
<div className="bg-white dark:bg-gray-900">
```

#### 7. 타입 안전성
```typescript
// types.ts에서 import
import type { Project, Influencer, InfluencerStatus } from '@/types';

// enum 사용
import { InfluencerStatus } from '@/types';
if (status === InfluencerStatus.Paid) { ... }
```

#### 8. API 라우트 작성
```typescript
// app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // ...
  return NextResponse.json({ success: true, data });
}
```

### 금지 사항
- ❌ `any` 타입 사용 (필요시 `unknown` 후 타입 가드)
- ❌ 직접 Firestore import (서비스 함수 사용)
- ❌ 인라인 스타일 (Tailwind 사용)
- ❌ console.log 프로덕션 코드에 남기기
- ❌ 환경 변수 하드코딩

### 권장 사항
- ✅ 에러 바운더리 사용
- ✅ Loading/Empty 상태 처리
- ✅ TypeScript strict mode
- ✅ 접근성 (aria-label, role 등)
- ✅ 반응형 디자인 (모바일 우선)

---

## 🚀 배포 가이드

### 로컬 개발
```bash
cd egongegong-next
pnpm install
pnpm dev
# http://localhost:3000
```

### 프로덕션 빌드
```bash
pnpm build
pnpm start
```

### Vercel 배포 (권장)
1. GitHub 레포지토리 연결
2. 환경 변수 설정 (Vercel Dashboard)
3. 자동 배포 (main 브랜치 push 시)

### Firebase Hosting 배포
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인 & 초기화
firebase login
firebase init hosting

# 빌드 & 배포
pnpm build
firebase deploy --only hosting
```

### 환경별 설정
| 환경 | Firebase 프로젝트 | 도메인 |
|------|------------------|--------|
| Development | egongegong-eoeo-dev | localhost:3000 |
| Staging | egongegong-eoeo-staging | staging.egongegong.com |
| Production | egongegong-eoeo | egongegong.com |

---

## 📚 추가 리소스

### 문서
- [DATA_FLOW.md](./egongegong-next/docs/DATA_FLOW.md) - 상세 데이터 흐름
- [Next.js 문서](https://nextjs.org/docs)
- [Firebase 문서](https://firebase.google.com/docs)
- [HeroUI 문서](https://heroui.com)

### 관련 레포지토리
- `vite-original/` - 원본 Vite 프로젝트 (레퍼런스)
- `_vite-reference/` - Vite UI 컴포넌트 레퍼런스

---

## 📞 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/sjh-eoeo/egongegong-workspace/issues)

---

*마지막 업데이트: 2025년 12월 2일*
