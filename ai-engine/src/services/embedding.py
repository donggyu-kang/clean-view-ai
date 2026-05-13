import google.generativeai as genai
from src.core.config import settings
from typing import List
import logging
from src.core.otel import get_tracer

# 로깅 설정: 운영 환경에서의 문제 추적을 위해 사용합니다.
logger = logging.getLogger(__name__)
tracer = get_tracer()

class EmbeddingService:
    """
    Google Gemini 'text-embedding-004' 모델을 사용하여
    텍스트 데이터를 의미론적 숫자 배열(벡터)로 변환하는 서비스
    해당 벡터는 pgvector에 저장되어 유사도 검색에 사용
    """

    def __init__(self):
        # Issue #1에서 설정한 API 키와 모델명을 로드합니다.
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        # 모델명에서 'models/' 접두사가 중복되지 않도록 처리
        model_name = settings.EMBEDDING_MODEL
        if not model_name.startswith('models/'):
            model_name = f"models/{model_name}"
        
        self.model = settings.EMBEDDING_MODEL

    async def get_embedding(self, text: str) -> List[float]:
        """
        단일 문장을 768차원 벡터로 변환
        질문 검색(Retrieval) 시 사용
        """
        # 'embedding_generation' 스팬 시작
        with tracer.start_as_current_span("embedding_generation") as span:
            try:
                # 텍스트 전처리: 줄바꿈 제거 및 양끝 공백 제거
                cleaned_text = text.replace("\n", " ").strip()
                if not cleaned_text:
                    return []
                
                # 커스텀 속성 기록 (Attributes)
                span.set_attribute("ai.input.text_length", len(cleaned_text))
                span.set_attribute("ai.embedding.model_name", self.model)

                # Google Generative AI SDK 호출
                # task_type="retrieval_document"는 문서 저장 및 검색에 최적화된 옵션
                result = genai.embed_content(
                    model=self.model,
                    content=cleaned_text,
                    task_type="retrieval_document",
                    output_dimensionality=768
                )
                
                # 결과 속성 기록
                span.set_attribute("ai.embedding.vector_dimension", 768)

                # 768차원 리스트 반환
                return result['embedding']
            
            except Exception as e:
                span.record_exception(e) # 에러 정보 기록
                logger.error(f"단일 임베딩 생성 실패: {str(e)}")
                raise e

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        여러 문장을 한 번에 벡터로 변환(Batch 처리).
        지식 저장(Ingestion) 시 API 호출 횟수를 줄여 속도를 높임
        """
        try:
            # 빈 문자열을 제외하고 리스트 정제
            cleaned_texts = [t.replace("\n", " ").strip() for t in texts if t.strip()]
            
            if not cleaned_texts:
                return []

            # 한 번의 API 호출로 여러 개의 임베딩을 생성 (성능 최적화)
            result = genai.embed_content(
                model=self.model,
                content=cleaned_texts,
                task_type="retrieval_document",
                output_dimensionality=768
            )
            
            return result['embeddings']
            
        except Exception as e:
            logger.error(f"배치 임베딩 생성 실패: {str(e)}")
            raise e

# 전역에서 공유하여 사용할 싱글톤 인스턴스 생성
embedding_service = EmbeddingService()