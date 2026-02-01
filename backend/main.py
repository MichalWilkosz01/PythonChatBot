import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Importujemy middleware
from fastapi.responses import RedirectResponse
from app.api.endpoints.users import router as users_router
from app.api.endpoints.chat import router as chat_router

LOCALHOST = "127.0.0.1"

app = FastAPI()

# --- KONFIGURACJA CORS ---
# Tutaj definiujesz, kto może rozmawiać z Twoim API
origins = [
    "http://localhost:5173",  # Adres Twojego Reacta (Vite)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Zezwalaj na te adresy
    allow_credentials=True,           # Pozwalaj na przesyłanie ciasteczek/autoryzacji
    allow_methods=["*"],              # Pozwalaj na wszystkie metody (GET, POST, itp.)
    allow_headers=["*"],              # Pozwalaj na wszystkie nagłówki
)
# -------------------------

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

app.include_router(users_router)
app.include_router(chat_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host=LOCALHOST, port=8000, reload=True)