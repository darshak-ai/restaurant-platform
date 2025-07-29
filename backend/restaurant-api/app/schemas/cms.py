from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.cms import ContentType, ContentStatus

class CMSContentBase(BaseModel):
    title: str
    slug: str
    content_type: ContentType
    content: Optional[str] = None
    excerpt: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    featured_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None

class CMSContentCreate(CMSContentBase):
    status: ContentStatus = ContentStatus.DRAFT
    display_order: int = 0
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

class CMSContentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    status: Optional[ContentStatus] = None
    meta_data: Optional[Dict[str, Any]] = None
    featured_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    display_order: Optional[int] = None
    is_featured: Optional[bool] = None
    show_in_menu: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class CMSContentResponse(CMSContentBase):
    id: int
    status: ContentStatus
    display_order: int
    is_featured: bool
    show_in_menu: bool
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CMSContentSummary(BaseModel):
    id: int
    title: str
    slug: str
    content_type: ContentType
    status: ContentStatus
    is_featured: bool
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
