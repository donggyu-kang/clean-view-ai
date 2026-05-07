from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    SQLAlchemy 모델의 최상위 베이스 클래스
    이 클래스를 상속받아야 Alembic이 모델을 추적할 수 있음 
    """
    pass