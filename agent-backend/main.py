from fastapi import FastAPI   # Import the FastAPI web framework
from database import engine  # Import database connection object
from models import Base     # Import SQLAlchemy Base class (table definitions)


app = FastAPI()

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    
@app.get("/")    # Create a GET endpoint at URL /
def read_root():   # Function that handles requests
    return {"Hello": "World"} # Return JSON response