import re
from typing import List, Dict, Any

def parse_answer_to_segments(answer: str, retrieved_refs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    LLM의 답변 원문을 문장 단위로 정교하게 쪼개고, 문장 내에 포함된 [1], [2, 3] 등 
    모든 형태의 인라인 출처 태그를 추출하여 실제 DB 레코드와 매핑합니다.
    """
    # 1단계: 답변 전체를 문장 마침표(. ! ?) 또는 줄바꿈(\n) 기준으로 1차 러프하게 분할
    raw_sentences = re.split(r'(?<=[.!?])\s+|\n', answer)
    
    segments = []
    
    for sentence in raw_sentences:
        cleaned_sentence = sentence.strip()
        if not cleaned_sentence:
            continue
            
        # 기본 스펙 (출처 미검출 시 일반 지식 취급)
        segment_data = {
            "text": cleaned_sentence,
            "has_citation": False,
            "ref_id": None,
            "session_id": None
        }
        
        # 2단계: 문장 어딘가에 포함된 모든 대괄호 숫자 패턴(예: [3] 또는 [2, 3])을 정밀 수색
        # 숫자만 쏙쏙 뽑아내기 위해 \d+ 규칙 사용
        citation_finder = re.findall(r'\[([\d\s,]+)\]', cleaned_sentence)
        
        if citation_finder:
            # 발견된 대괄호 묶음들 중 첫 번째 묶음을 타겟팅 (예: "2, 3")
            raw_nums = citation_finder[0]
            
            # 쉼표 기반으로 쪼개서 개별 인덱스 숫자 리스트로 전환 (예: [2, 3])
            ref_indices = [int(num.strip()) for num in raw_nums.split(',') if num.strip().isdigit()]
            
            if ref_indices:
                # 3단계: 여러 인용 번호 중 가장 대표성 있는 첫 번째 출처 인덱스를 매칭용 마스터 키로 채택
                primary_idx = ref_indices[0] - 1  # 1-based index를 0-based index로 보정
                
                # 가용 references 메모리 인덱스 유효 범위 방어선 구축
                if 0 <= primary_idx < len(retrieved_refs):
                    target_chunk = retrieved_refs[primary_idx]
                    
                    segment_data["has_citation"] = True
                    segment_data["ref_id"] = target_chunk["id"]          # UI 팝업용 기억 마스터 키
                    segment_data["session_id"] = target_chunk["session_id"]  # 유리병 AI 카드 소속방 ID
                    
                    # UI 미관을 해치지 않도록 문장 텍스트 본문에서 대괄호 꼬리표 [3] 양식을 깔끔하게 소거 가능
                    # 기획서 사상에 맞게 원문 유지를 원하면 아래 줄은 주석 처리 가능
                    # segment_data["text"] = re.sub(r'\[[\d\s,]+\]', '', cleaned_sentence).strip()

        segments.append(segment_data)
        
    return segments