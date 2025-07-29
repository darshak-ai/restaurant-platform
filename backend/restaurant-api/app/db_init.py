"""
Database initialization script
Run this to create sample data for development
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.restaurant import Restaurant
from app.models.menu import Menu, MenuCategory, MenuItem
from app.models.cms import CMSContent, ContentType, ContentStatus
from app.core.security import get_password_hash
import json

def create_sample_data():
    """Create sample data for development"""
    db = SessionLocal()
    
    try:
        admin_user = User(
            email="admin@restaurant.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)
        
        restaurant = Restaurant(
            name="Delicious Bites Restaurant",
            address="123 Main Street",
            city="San Francisco",
            state="CA",
            zip_code="94102",
            phone_number="(555) 123-4567",
            email="info@deliciousbites.com",
            latitude=37.7749,
            longitude=-122.4194,
            description="A family-owned restaurant serving fresh, delicious meals made with locally sourced ingredients.",
            website="https://deliciousbites.com",
            opening_hours=json.dumps({
                "monday": {"open": "11:00", "close": "22:00"},
                "tuesday": {"open": "11:00", "close": "22:00"},
                "wednesday": {"open": "11:00", "close": "22:00"},
                "thursday": {"open": "11:00", "close": "22:00"},
                "friday": {"open": "11:00", "close": "23:00"},
                "saturday": {"open": "10:00", "close": "23:00"},
                "sunday": {"open": "10:00", "close": "21:00"}
            })
        )
        db.add(restaurant)
        db.flush()
        
        menu = Menu(
            restaurant_id=restaurant.id,
            name="Main Menu",
            description="Our signature dishes and favorites",
            is_default=True
        )
        db.add(menu)
        db.flush()
        
        appetizers = MenuCategory(
            menu_id=menu.id,
            name="Appetizers",
            description="Start your meal with our delicious appetizers",
            display_order=1
        )
        mains = MenuCategory(
            menu_id=menu.id,
            name="Main Courses",
            description="Hearty and satisfying main dishes",
            display_order=2
        )
        desserts = MenuCategory(
            menu_id=menu.id,
            name="Desserts",
            description="Sweet endings to your perfect meal",
            display_order=3
        )
        
        db.add_all([appetizers, mains, desserts])
        db.flush()
        
        menu_items = [
            MenuItem(
                menu_id=menu.id,
                category_id=appetizers.id,
                name="Crispy Calamari",
                description="Fresh squid rings served with marinara sauce",
                price=12.99,
                calories=320,
                ingredients=json.dumps(["squid", "flour", "marinara sauce", "lemon"]),
                allergens=json.dumps(["gluten", "seafood"]),
                is_featured=True,
                display_order=1
            ),
            MenuItem(
                menu_id=menu.id,
                category_id=appetizers.id,
                name="Buffalo Wings",
                description="Spicy chicken wings with blue cheese dip",
                price=14.99,
                calories=450,
                ingredients=json.dumps(["chicken wings", "buffalo sauce", "blue cheese", "celery"]),
                allergens=json.dumps(["dairy"]),
                display_order=2
            ),
            MenuItem(
                menu_id=menu.id,
                category_id=mains.id,
                name="Grilled Salmon",
                description="Atlantic salmon with lemon herb butter and seasonal vegetables",
                price=24.99,
                calories=520,
                ingredients=json.dumps(["salmon", "lemon", "herbs", "butter", "vegetables"]),
                allergens=json.dumps(["fish", "dairy"]),
                dietary_info=json.dumps(["gluten-free"]),
                is_featured=True,
                display_order=1
            ),
            MenuItem(
                menu_id=menu.id,
                category_id=mains.id,
                name="Ribeye Steak",
                description="12oz prime ribeye with garlic mashed potatoes",
                price=32.99,
                calories=780,
                ingredients=json.dumps(["ribeye steak", "potatoes", "garlic", "butter"]),
                allergens=json.dumps(["dairy"]),
                display_order=2
            ),
            MenuItem(
                menu_id=menu.id,
                category_id=desserts.id,
                name="Chocolate Lava Cake",
                description="Warm chocolate cake with molten center and vanilla ice cream",
                price=8.99,
                calories=420,
                ingredients=json.dumps(["chocolate", "flour", "eggs", "vanilla ice cream"]),
                allergens=json.dumps(["gluten", "dairy", "eggs"]),
                display_order=1
            )
        ]
        
        db.add_all(menu_items)
        
        cms_contents = [
            CMSContent(
                title="About Us",
                slug="about",
                content_type=ContentType.PAGE,
                status=ContentStatus.PUBLISHED,
                content="<h1>About Delicious Bites</h1><p>We are a family-owned restaurant committed to serving fresh, delicious meals made with locally sourced ingredients. Our passion for food and hospitality drives us to create memorable dining experiences for our guests.</p>",
                excerpt="Learn about our story and commitment to quality dining.",
                meta_title="About Us - Delicious Bites Restaurant",
                meta_description="Learn about Delicious Bites Restaurant, our story, and our commitment to quality dining experiences.",
                display_order=1,
                show_in_menu=True
            ),
            CMSContent(
                title="Contact Us",
                slug="contact",
                content_type=ContentType.CONTACT_INFO,
                status=ContentStatus.PUBLISHED,
                content=json.dumps({
                    "phone": "(555) 123-4567",
                    "email": "info@deliciousbites.com",
                    "address": "123 Main Street, San Francisco, CA 94102",
                    "hours": {
                        "monday": "11:00 AM - 10:00 PM",
                        "tuesday": "11:00 AM - 10:00 PM",
                        "wednesday": "11:00 AM - 10:00 PM",
                        "thursday": "11:00 AM - 10:00 PM",
                        "friday": "11:00 AM - 11:00 PM",
                        "saturday": "10:00 AM - 11:00 PM",
                        "sunday": "10:00 AM - 9:00 PM"
                    }
                }),
                meta_title="Contact Us - Delicious Bites Restaurant",
                meta_description="Get in touch with Delicious Bites Restaurant. Find our location, hours, and contact information.",
                display_order=2,
                show_in_menu=True
            ),
            CMSContent(
                title="Welcome to Delicious Bites",
                slug="hero-banner-1",
                content_type=ContentType.HERO_BANNER,
                status=ContentStatus.PUBLISHED,
                content="Experience the finest dining with fresh, locally sourced ingredients",
                excerpt="Our signature hero banner",
                featured_image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop",
                display_order=1
            )
        ]
        
        db.add_all(cms_contents)
        
        db.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    
    create_sample_data()
