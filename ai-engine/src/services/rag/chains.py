import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from src.core.config import settings
from src.services.rag.prompts import rag_prompt
from src.core.otel import get_tracer

# 로깅 설정
logger = logging.getLogger(__name__)
tracer = get_tracer()

class RAGChain:
    """
    프롬프트와 Gemini LLM을 연결하여 
    검색된 맥락(Context) 기반의 답변을 생성하는 체인 클래스
    """

    def __init__(self):
        # 1. Gemini 모델 초기화
        # RAG 답변의 정확도를 높이기 위해 온도를 낮게(0.2) 설정
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
            # 안전 설정이나 기타 파라미터를 여기서 조정 가능
        )

        # 2. LCEL(LangChain Expression Language)을 사용하여 체인 구성
        # 입력: {"question": ..., "context": ..., "history": ...}
        # 출력: AIMessage (텍스트 답변 포함)
        self.chain = rag_prompt | self.llm

    async def ainvoke(self, question: str, context: str, history: list = None) -> str:
        """
        비동기로 AI 답변을 생성합니다.
        """
        with tracer.start_as_current_span("prompt_augmentation") as prompt_span:
            prompt_span.set_attribute("prompt.injected_context_length", len(context))
            # 가이드라인에 따라 조각 개수 계산 (조인 시 사용한 \n\n 기준)
            context_count = context.count("\n\n") + 1 if context and context != "관련된 기억이 없습니다." else 0
            prompt_span.set_attribute("prompt.context_count", context_count)
            prompt_span.set_attribute("prompt.is_context_truncated", False) # 기본값
        
        with tracer.start_as_current_span("llm_inference") as llm_span:
            try:
                # 기본 정보 기록
                llm_span.set_attribute("ai.llm.model_name", self.model_name)

                # history가 없을 경우 빈 리스트로 초기화
                if history is None:
                    history = []

                # 체인 실행
                response = await self.chain.ainvoke({
                    "question": question,
                    "context": context,
                    "history": history
                })

                # LangChain Gemini 인터페이스의 usage_metadata 활용
                usage = response.response_metadata.get("token_usage", {})
                llm_span.set_attribute("ai.llm.token.prompt", usage.get("prompt_token_count", 0))
                llm_span.set_attribute("ai.llm.token.completion", usage.get("candidates_token_count", 0))
                llm_span.set_attribute("ai.llm.finish_reason", "stop")

                # Gemini의 텍스트 응답만 추출하여 반환
                return response.content

            except Exception as e:
                llm_span.record_exception(e)
                llm_span.set_attribute("ai.llm.finish_reason", "error")
                logger.error(f"LLM 답변 생성 중 오류 발생: {str(e)}")
                return "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다."

# 전역에서 사용할 인스턴스 생성
rag_chain = RAGChain()