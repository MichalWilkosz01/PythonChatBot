import uvicorn
from fastapi import FastAPI
from app.api.endpoints.users import router as users_router

app = FastAPI()

# Dodajemy router użytkowników
app.include_router(users_router)

# To jest kluczowa część, która uruchamia serwer
if __name__ == "__main__":
    # "main:app" oznacza: szukaj w pliku main.py obiektu app
    # reload=True sprawia, że serwer zrestartuje się sam po zmianie kodu
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)