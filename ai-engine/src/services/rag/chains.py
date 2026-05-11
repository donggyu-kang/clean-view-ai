import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from src.core.config import settings
from src.services.rag.prompts import rag_prompt

# 로깅 설정
logger = logging.getLogger(__name__)

class RAGChain:
    """
    프롬프트와 Gemini LLM을 연결하여 
    검색된 맥락(Context) 기반의 답변을 생성하는 체인 클래스
    """

    def __init__(self):
        # 1. Gemini 모델 초기화
        # RAG 답변의 정확도를 높이기 위해 온도를 낮게(0.2) 설정
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
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
        try:
            # history가 없을 경우 빈 리스트로 초기화
            if history is None:
                history = []

            # 체인 실행
            response = await self.chain.ainvoke({
                "question": question,
                "context": context,
                "history": history
            })

            # Gemini의 텍스트 응답만 추출하여 반환
            return response.content

        except Exception as e:
            logger.error(f"LLM 답변 생성 중 오류 발생: {str(e)}")
            return "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다."

# 전역에서 사용할 인스턴스 생성
rag_chain = RAGChain()