from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, players, payments , match_days, expenses
import os

app = FastAPI(
    title="Football Management System", 
    version="1.0.0",
    description="API for managing football team finances and operations"
)

#
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  
        "http://127.0.0.1:3000", 
        "http://srv887319.hstgr.cloud:3000"
    ],
    allow_credentials=True,  # Important for cookies/sessions
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(players.router) 
app.include_router(payments.router) 
app.include_router(match_days.router)
app.include_router(expenses.router)

@app.get("/")
def root():
    return {
        "message": "Football Management System API", 
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": os.getenv("DATABASE_URL", "not configured").split("@")[-1] if "@" in os.getenv("DATABASE_URL", "") else "not configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)