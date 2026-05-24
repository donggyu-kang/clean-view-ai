# src/utils/parser.py

import re
from typing import List, Dict, Any

from sqlalchemy import true

def parse_answer_to_segments(answer: str, retrieved_refs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    LLM의 답변 원문을 문장/어구 단위로 정밀 분해하고 [번호] 마킹을 파싱하여
    프론트엔드가 하이라이트 밑줄을 치고 '어떻게 알았어?' 팝업을 띄울 수 있는 맵 데이터를 빌드
    """
    # 정규식 설명: 문장 끝 공백이나 줄바꿈을 포함하여 문장을 나누되, 뒤에 붙은 [1] 같은 번호 마킹을 캡처 그룹으로 격리
    # 예: "공부하느라 앉아있는 시간이 깁니다[1]." -> 그룹1: 문장 본문, 그룹2: 인덱스 숫자 '1'
    pattern = r"([^.!?\n]+(?:[.!?]+|(?=\n)|$))\s*(?:\[(\d+)\])?"
    matches = re.findall(pattern, answer)
    
    segments = []
    
    for text_block, ref_num in matches:
        cleaned_text = text_block.strip()
        if not cleaned_text:
            continue
            
        # 기본 구조 세팅 (출처가 없는 순수 일반 지식 문장용 기본값)
        segment_data = {
            "text": cleaned_text,
            "has_citation": False,
            "ref_id": None,
            "session_id": None
        }
        
        # 문장 끝에 [1] 또는 [2] 같은 출처 태깅 꼬리표가 발견되었다면 하이드레이션 실행
        if ref_num:
            idx = int(ref_num) - 1 # 프롬프트가 start=1로 쐈으므로 배열 인덱스 맞춤용 -1
            
            # 인출되었던 원래 references 가용 범위 내에 있는지 안전 검사
            if 0 <= idx < len(retrieved_refs):
                target_chunk = retrieved_refs[idx]
                
                segment_data["has_citation"] = true
                segment_data["ref_id"] = target_chunk["id"]          # 클릭 시 팝업을 띄울 기억의 마스터 키
                segment_data["session_id"] = target_chunk["session_id"]  # 유리병 AI 카드 출처 매핑용 방 숫자 ID
        
        segments.append(segment_data)
        
    return segments