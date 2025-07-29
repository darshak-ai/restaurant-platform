from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.cms import CMSContent
from app.schemas.cms import CMSContentCreate, CMSContentUpdate
from fastapi import HTTPException, status
from datetime import datetime
import json

class CMSService:
    def __init__(self, db: Session):
        self.db = db

    def create_content(self, content_data: CMSContentCreate) -> CMSContent:
        existing_content = self.db.query(CMSContent).filter(CMSContent.slug == content_data.slug).first()
        if existing_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content with this slug already exists"
            )

        meta_data_json = json.dumps(content_data.meta_data) if content_data.meta_data else None
        gallery_images_json = json.dumps(content_data.gallery_images) if content_data.gallery_images else None

        db_content = CMSContent(
            title=content_data.title,
            slug=content_data.slug,
            content_type=content_data.content_type,
            status=content_data.status,
            content=content_data.content,
            excerpt=content_data.excerpt,
            meta_data=meta_data_json,
            featured_image=content_data.featured_image,
            gallery_images=gallery_images_json,
            display_order=content_data.display_order,
            meta_title=content_data.meta_title,
            meta_description=content_data.meta_description,
            meta_keywords=content_data.meta_keywords
        )

        if content_data.status == "published":
            db_content.published_at = datetime.utcnow()

        self.db.add(db_content)
        self.db.commit()
        self.db.refresh(db_content)
        return db_content

    def get_content(self, content_id: int) -> Optional[CMSContent]:
        return self.db.query(CMSContent).filter(CMSContent.id == content_id).first()

    def get_content_by_slug(self, slug: str) -> Optional[CMSContent]:
        return self.db.query(CMSContent).filter(CMSContent.slug == slug).first()

    def get_contents(self, 
                    content_type: Optional[str] = None, 
                    status: Optional[str] = None,
                    published_only: bool = False,
                    skip: int = 0, 
                    limit: int = 100) -> List[CMSContent]:
        query = self.db.query(CMSContent)
        
        if content_type:
            query = query.filter(CMSContent.content_type == content_type)
        
        if status:
            query = query.filter(CMSContent.status == status)
        
        if published_only:
            query = query.filter(
                CMSContent.status == "published",
                CMSContent.published_at <= datetime.utcnow()
            )
            query = query.filter(
                (CMSContent.expires_at.is_(None)) | 
                (CMSContent.expires_at > datetime.utcnow())
            )

        return query.order_by(CMSContent.display_order, CMSContent.created_at.desc()).offset(skip).limit(limit).all()

    def update_content(self, content_id: int, content_data: CMSContentUpdate) -> Optional[CMSContent]:
        db_content = self.get_content(content_id)
        if not db_content:
            return None

        update_data = content_data.dict(exclude_unset=True)
        
        if 'slug' in update_data and update_data['slug'] != db_content.slug:
            existing_content = self.db.query(CMSContent).filter(
                CMSContent.slug == update_data['slug'],
                CMSContent.id != content_id
            ).first()
            if existing_content:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Content with this slug already exists"
                )

        if 'meta_data' in update_data and update_data['meta_data'] is not None:
            update_data['meta_data'] = json.dumps(update_data['meta_data'])
        if 'gallery_images' in update_data and update_data['gallery_images'] is not None:
            update_data['gallery_images'] = json.dumps(update_data['gallery_images'])

        old_status = db_content.status
        for field, value in update_data.items():
            setattr(db_content, field, value)

        if 'status' in update_data and update_data['status'] == "published" and old_status != "published":
            db_content.published_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(db_content)
        return db_content

    def delete_content(self, content_id: int) -> bool:
        db_content = self.get_content(content_id)
        if not db_content:
            return False

        self.db.delete(db_content)
        self.db.commit()
        return True

    def get_published_pages(self) -> List[CMSContent]:
        """Get all published pages for navigation"""
        return self.db.query(CMSContent).filter(
            CMSContent.content_type == "page",
            CMSContent.status == "published",
            CMSContent.show_in_menu == True,
            CMSContent.published_at <= datetime.utcnow()
        ).filter(
            (CMSContent.expires_at.is_(None)) | 
            (CMSContent.expires_at > datetime.utcnow())
        ).order_by(CMSContent.display_order).all()

    def get_gallery_images(self, limit: int = 50) -> List[CMSContent]:
        """Get gallery images"""
        return self.db.query(CMSContent).filter(
            CMSContent.content_type == "gallery_image",
            CMSContent.status == "published"
        ).order_by(CMSContent.display_order, CMSContent.created_at.desc()).limit(limit).all()

    def get_hero_banners(self, active_only: bool = True) -> List[CMSContent]:
        """Get hero banners"""
        query = self.db.query(CMSContent).filter(CMSContent.content_type == "hero_banner")
        
        if active_only:
            query = query.filter(
                CMSContent.status == "published",
                CMSContent.published_at <= datetime.utcnow()
            ).filter(
                (CMSContent.expires_at.is_(None)) | 
                (CMSContent.expires_at > datetime.utcnow())
            )
        
        return query.order_by(CMSContent.display_order).all()

    def get_announcements(self, active_only: bool = True) -> List[CMSContent]:
        """Get announcements"""
        query = self.db.query(CMSContent).filter(CMSContent.content_type == "announcement")
        
        if active_only:
            query = query.filter(
                CMSContent.status == "published",
                CMSContent.published_at <= datetime.utcnow()
            ).filter(
                (CMSContent.expires_at.is_(None)) | 
                (CMSContent.expires_at > datetime.utcnow())
            )
        
        return query.order_by(CMSContent.created_at.desc()).all()

    def get_contact_info(self) -> Optional[CMSContent]:
        """Get contact information"""
        return self.db.query(CMSContent).filter(
            CMSContent.content_type == "contact_info",
            CMSContent.status == "published"
        ).first()

    def search_content(self, search_term: str, content_type: Optional[str] = None, limit: int = 20) -> List[CMSContent]:
        """Search content by title or content"""
        search_pattern = f"%{search_term}%"
        query = self.db.query(CMSContent).filter(
            CMSContent.status == "published",
            (CMSContent.title.ilike(search_pattern) | CMSContent.content.ilike(search_pattern))
        )
        
        if content_type:
            query = query.filter(CMSContent.content_type == content_type)
        
        return query.order_by(CMSContent.title).limit(limit).all()
