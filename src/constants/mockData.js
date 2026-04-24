import { T } from './tokens'

// 백엔드 연동 전 임시 목 데이터
export const MEMORIES = [
  {
    id: 'mem-001',
    matchPct: 91,
    date: '4월 1일',
    fromRoom: '직업 고민',
    fromRoomId: 3,
    isCurrent: false,
    excerpt: '"저는 백엔드 개발자라서 장시간 집중 작업이 많아요. 건강식단이 중요한 것 같아요."',
    blocked: false,
    usedIn: true,
    segColor: '#F59E0B',
  },
  {
    id: 'mem-002',
    matchPct: 83,
    date: '3월 22일',
    fromRoom: '운동 루틴',
    fromRoomId: 5,
    isCurrent: false,
    excerpt: '"아침에 탄수화물보다 단백질 위주로 먹는 게 집중력 유지에 도움된다고 하더라고요."',
    blocked: false,
    usedIn: true,
    segColor: '#8B5CF6',
  },
  {
    id: 'mem-003',
    matchPct: 67,
    date: '오늘',
    fromRoom: '현재 대화',
    fromRoomId: null,
    isCurrent: true,
    excerpt: '"오늘 아침 뭐먹을까?"',
    blocked: false,
    usedIn: false,
    segColor: T.success,
  },
]

// AI 답변 세그먼트 (어떤 메모리에서 온 문장인지 표시)
export const AI_SEGMENTS = [
  { text: '오늘 아침 식사로는 ', memId: null },
  { text: '백엔드 개발자로서 장시간 집중 작업을 고려하면', memId: 'mem-001' },
  { text: ' 고단백 식단이 좋을 것 같아요. ', memId: null },
  { text: '아침에 탄수화물보다 단백질 위주로 드시면 집중력 유지에 효과적입니다.', memId: 'mem-002' },
  { text: ' 예를 들면 계란 2개, 그릭 요거트, 견과류 조합을 추천드려요.', memId: null },
]

// AI 처리 파이프라인 단계
export const PIPELINE = [
  { label: '요청 수신',   sub: 'Spring Boot', ms: 38,  icon: 'inbox'  },
  { label: '기억 검색',   sub: 'FastAPI',     ms: 124, icon: 'search' },
  { label: '유사도 계산', sub: 'pgvector',    ms: 89,  icon: 'cpu'    },
  { label: '답변 생성',   sub: 'GPT-4o',      ms: 921, icon: 'zap'    },
]

export const TOTAL_MS = PIPELINE.reduce((s, p) => s + p.ms, 0)
