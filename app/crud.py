from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_, desc, asc
from typing import Optional, List, Tuple
from . import models, schemas

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session) -> List[models.User]:
    return db.execute(select(models.User)).scalars().all()

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.get(models.User, user_id)

def create_listing(db: Session, data: schemas.ListingCreate) -> models.Listing:
    db_listing = models.Listing(**data.model_dump())
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

def update_listing(db: Session, listing_id: int, data: schemas.ListingUpdate) -> Optional[models.Listing]:
    listing = db.get(models.Listing, listing_id)
    if not listing:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(listing, k, v)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

def delete_listing(db: Session, listing_id: int) -> bool:
    listing = db.get(models.Listing, listing_id)
    if not listing:
        return False
    db.delete(listing)
    db.commit()
    return True

def get_listing(db: Session, listing_id: int) -> Optional[models.Listing]:
    return db.get(models.Listing, listing_id)

def search_listings(
    db: Session,
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = 1,
    page_size: int = 12,
    sort: Optional[str] = None  # 'price_asc', 'price_desc', 'date_desc'
) -> Tuple[List[models.Listing], int]:
    stmt = select(models.Listing).where(models.Listing.is_active == True)

    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(or_(
            func.lower(models.Listing.title).like(like),
            func.lower(models.Listing.description).like(like)
        ))
    if category:
        stmt = stmt.where(models.Listing.category == category)
    if min_price is not None:
        stmt = stmt.where(models.Listing.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(models.Listing.price <= max_price)

    total = db.execute(stmt.with_only_columns(func.count())).scalar_one()
    # Sorting
    if sort == "price_asc":
        stmt = stmt.order_by(asc(models.Listing.price))
    elif sort == "price_desc":
        stmt = stmt.order_by(desc(models.Listing.price))
    else:
        stmt = stmt.order_by(desc(models.Listing.created_at))

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)
    items = db.execute(stmt).scalars().all()
    return items, total