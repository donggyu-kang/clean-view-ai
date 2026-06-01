"""alter metadata_json to jsonb

Revision ID: e2716c21a95d
Revises: d2ab9cb93830
Create Date: 2026-06-01 17:31:48.110882

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2716c21a95d'
down_revision: Union[str, Sequence[str], None] = 'd2ab9cb93830'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 라이브 PostgreSQL의 document_chunks 테이블 내 metadata_json 컬럼을 고속 JSONB로 형변환합니다.
    # USING 구문을 더해 기존에 쌓여있던 텍스트 기반 JSON 데이터가 바이너리 고밀도 포맷인 JSONB로 유실 없이 안전하게 캐스팅됩니다.
    op.execute(
        "ALTER TABLE document_chunks ALTER COLUMN metadata_json TYPE JSONB USING metadata_json::JSONB"
    )


def downgrade() -> None:
    """Downgrade schema."""
    # 만약 시스템을 이전 버전으로 되돌려야 할 경우, 컬럼 타입을 다시 일반 generic JSON으로 강제 강등합니다.
    op.execute(
        "ALTER TABLE document_chunks ALTER COLUMN metadata_json TYPE JSON USING metadata_json::JSON"
    )