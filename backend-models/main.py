from fastapi import FastAPI

app = FastAPI(title="My FastAPI App")
@app.get("/")
def root():
    return {"message": "FastAPI server is running 🚀"}