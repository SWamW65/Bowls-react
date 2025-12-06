from fastapi import FastAPI
from contextlib import asynccontextmanager

from database import init_db
from router import router
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    # (можно добавить код для закрытия соединений)

app = FastAPI(lifespan=lifespan)
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")