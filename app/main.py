from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional
from .database import Base, engine, SessionLocal
from . import models, schemas, crud
from pathlib import Path

app = FastAPI(title="Campus Marketplace API")

# CORS (allow local access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed default users and listings if DB is empty
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            u1 = crud.create_user(
                db,
                schemas.UserCreate(
                    name="Admin User",
                    email="admin@example.com",
                    phone="+7 999 000 00 00"
                )
            )
            u2 = crud.create_user(
                db,
                schemas.UserCreate(
                    name="Student One",
                    email="student1@example.com",
                    phone="+7 900 111 22 33"
                )
            )
            # Seed listings (images как строка JSON)
            sample1 = schemas.ListingCreate(
                title="Алгебра. Учебник 1 курс",
                description="Почти новый учебник, без пометок.",
                price=500.0,
                category="Учебники",
                condition="Как новый",
                images="[]",   # <--- фикс
                location="УРФУ, ГУК",
                seller_id=u2.id
            )
            sample2 = schemas.ListingCreate(
                title="Аренда штатива для камеры",
                description="Надежный штатив, высота до 160см. На неделю.",
                price=300.0,
                category="Аренда оборудования",
                condition="Б/У",
                images="[]",   # <--- фикс
                location="Общежитие №3",
                seller_id=u1.id
            )
            crud.create_listing(db, sample1)
            crud.create_listing(db, sample2)
    finally:
        db.close()

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Users
@app.get("/api/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

# Listings
@app.get("/api/listings", response_model=schemas.PaginatedListings)
def list_listings(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    sort: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    items, total = crud.search_listings(
        db, q, category, min_price, max_price, page, page_size, sort
    )
    return {"items": items, "total": total, "page": page, "page_size": page_size}

@app.get("/api/listings/{listing_id}", response_model=schemas.ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    return listing

@app.post("/api/listings", response_model=schemas.ListingOut, status_code=201)
def create_listing(data: schemas.ListingCreate, db: Session = Depends(get_db)):
    # Validate user exists
    user = crud.get_user(db, data.seller_id)
    if not user:
        raise HTTPException(400, "Seller not found")
    return crud.create_listing(db, data)

@app.put("/api/listings/{listing_id}", response_model=schemas.ListingOut)
def update_listing(listing_id: int, data: schemas.ListingUpdate, db: Session = Depends(get_db)):
    listing = crud.update_listing(db, listing_id, data)
    if not listing:
        raise HTTPException(404, "Listing not found")
    return listing

@app.delete("/api/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_listing(db, listing_id)
    if not ok:
        raise HTTPException(404, "Listing not found")
    return

# Serve the frontend (static files)
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "campus-marketplace"
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
