import sqlite3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()


# React(localhost:5173)가 FastAPI(localhost:8000)에
# 요청을 보낼 수 있도록 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# Database
# --------------------

DB_PATH = "chatbot.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


init_db()


# --------------------
# Request model
# --------------------

class MessageRequest(BaseModel):
    content: str


# --------------------
# API
# --------------------

@app.get("/api/messages")
def get_messages():
    conn = get_db()

    rows = conn.execute(
        "SELECT * FROM messages ORDER BY id"
    ).fetchall()

    conn.close()

    return [dict(row) for row in rows]


@app.delete("/api/messages")
def delete_messages():
    conn = get_db()

    conn.execute("DELETE FROM messages")
    conn.commit()

    conn.close()

    return {"ok": True}


@app.post("/api/messages")
def send_message(request: MessageRequest):

    user_message = request.content

    # 사용자 메시지 저장
    conn = get_db()

    conn.execute(
        "INSERT INTO messages (role, content) VALUES (?, ?)",
        ("user", user_message)
    )

    # 서버 답변 생성
    if user_message == "안녕":
        assistant_message = "안녕하세요"
    else:
        assistant_message = "아직 구현되지 않은 기능입니다."

    # 서버 답변 저장
    cursor = conn.execute(
        "INSERT INTO messages (role, content) VALUES (?, ?)",
        ("assistant", assistant_message)
    )

    conn.commit()

    assistant_id = cursor.lastrowid

    conn.close()

    return {
        "id": assistant_id,
        "role": "assistant",
        "content": assistant_message
    }