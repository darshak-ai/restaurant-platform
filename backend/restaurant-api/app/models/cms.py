from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ContentType(enum.Enum):
    PAGE = "page"
    GALLERY_IMAGE = "gallery_image"
    HERO_BANNER = "hero_banner"
    ANNOUNCEMENT = "announcement"
    CONTACT_INFO = "contact_info"

class ContentStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class CMSContent(Base):
    __tablename__ = "cms_content"

    id = Column(Integer, primary_key=True, index=True)
    
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    content_type = Column(Enum(ContentType), nullable=False)
    status = Column(Enum(ContentStatus), default=ContentStatus.DRAFT)
    
    content = Column(Text, nullable=True)  # Main content (HTML/Markdown)
    excerpt = Column(Text, nullable=True)  # Short description
    meta_data = Column(Text, nullable=True)  # JSON string for additional data
    
    featured_image = Column(String, nullable=True)
    gallery_images = Column(Text, nullable=True)  # JSON array of image URLs
    
    meta_title = Column(String, nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(Text, nullable=True)
    
    display_order = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    show_in_menu = Column(Boolean, default=True)
    
    published_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
