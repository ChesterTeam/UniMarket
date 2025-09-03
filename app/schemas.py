from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float = Field(ge=0)
    category: str
    condition: Optional[str] = None
    images: Optional[List[str]] = None  # base64 strings or relative URLs
    location: Optional[str] = None
    is_active: bool = True

class ListingCreate(ListingBase):
    seller_id: int

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    category: Optional[str] = None
    condition: Optional[str] = None
    images: Optional[List[str]] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None

class ListingOut(ListingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    seller_id: int
    class Config:
        from_attributes = True

class PaginatedListings(BaseModel):
    items: List[ListingOut]
    total: int
    page: int
    page_size: int