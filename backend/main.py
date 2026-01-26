import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.api.endpoints.users import router as users_router
from app.api.endpoints.chat import router as chat_router

LOCALHOST = "127.0.0.1"

app = FastAPI()

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

app.include_router(users_router)
app.include_router(chat_router)
if __name__ == "__main__":
    uvicorn.run("main:app", host=LOCALHOST, port=8000, reload=True)