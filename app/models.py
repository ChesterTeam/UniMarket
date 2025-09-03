from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    # Listings relationship
    listings = relationship("Listing", back_populates="seller", cascade="all, delete-orphan")

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    category = Column(String(50), index=True, nullable=False)
    condition = Column(String(50), nullable=True)
    images = Column(Text, nullable=True)  # JSON array of base64 strings or URLs
    location = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    seller = relationship("User", back_populates="listings")