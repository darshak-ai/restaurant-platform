from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.cms import CMSContentCreate, CMSContentResponse, CMSContentUpdate, CMSContentSummary
from app.services.cms_service import CMSService
from app.utils.dependencies import get_current_admin_user, get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/cms", tags=["content management"])

@router.post("/", response_model=CMSContentResponse)
async def create_content(
    content_data: CMSContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create new content (Admin only)"""
    cms_service = CMSService(db)
    return cms_service.create_content(content_data)

@router.get("/", response_model=List[CMSContentSummary])
async def get_contents(
    content_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    published_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get all content"""
    cms_service = CMSService(db)
    
    if current_user is None or current_user.role.value not in ['admin', 'manager']:
        published_only = True
    
    contents = cms_service.get_contents(content_type, status, published_only, skip, limit)
    
    return [
        CMSContentSummary(
            id=content.id,
            title=content.title,
            slug=content.slug,
            content_type=content.content_type,
            status=content.status,
            is_featured=content.is_featured,
            published_at=content.published_at,
            created_at=content.created_at
        ) for content in contents
    ]

@router.get("/pages", response_model=List[CMSContentResponse])
async def get_published_pages(db: Session = Depends(get_db)):
    """Get all published pages for navigation"""
    cms_service = CMSService(db)
    return cms_service.get_published_pages()

@router.get("/gallery", response_model=List[CMSContentResponse])
async def get_gallery_images(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get gallery images"""
    cms_service = CMSService(db)
    return cms_service.get_gallery_images(limit)

@router.get("/banners", response_model=List[CMSContentResponse])
async def get_hero_banners(
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get hero banners"""
    cms_service = CMSService(db)
    return cms_service.get_hero_banners(active_only)

@router.get("/announcements", response_model=List[CMSContentResponse])
async def get_announcements(
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get announcements"""
    cms_service = CMSService(db)
    return cms_service.get_announcements(active_only)

@router.get("/contact", response_model=CMSContentResponse)
async def get_contact_info(db: Session = Depends(get_db)):
    """Get contact information"""
    cms_service = CMSService(db)
    contact_info = cms_service.get_contact_info()
    if not contact_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact information not found"
        )
    return contact_info

@router.get("/search", response_model=List[CMSContentResponse])
async def search_content(
    q: str = Query(..., description="Search term"),
    content_type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search content"""
    cms_service = CMSService(db)
    return cms_service.search_content(q, content_type, limit)

@router.get("/{content_id}", response_model=CMSContentResponse)
async def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get content by ID"""
    cms_service = CMSService(db)
    content = cms_service.get_content(content_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content.status != "published" and (current_user is None or current_user.role.value not in ['admin', 'manager']):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return content

@router.get("/slug/{slug}", response_model=CMSContentResponse)
async def get_content_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get content by slug"""
    cms_service = CMSService(db)
    content = cms_service.get_content_by_slug(slug)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content.status != "published" and (current_user is None or current_user.role.value not in ['admin', 'manager']):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return content

@router.put("/{content_id}", response_model=CMSContentResponse)
async def update_content(
    content_id: int,
    content_data: CMSContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update content (Admin only)"""
    cms_service = CMSService(db)
    content = cms_service.update_content(content_id, content_data)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return content

@router.delete("/{content_id}")
async def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete content (Admin only)"""
    cms_service = CMSService(db)
    success = cms_service.delete_content(content_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return {"message": "Content deleted successfully"}
