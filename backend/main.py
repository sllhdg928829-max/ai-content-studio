import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import auth, content, payment


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AI Content Studio API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(content.router)
app.include_router(payment.router)


@app.get("/")
def root():
    return {
        "name": "AI Content Studio",
        "version": "1.0.0",
        "status": "running",
        "time": datetime.datetime.utcnow().isoformat(),
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
