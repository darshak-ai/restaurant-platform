"""
Debug script to check menu data in database
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.menu import Menu, MenuCategory, MenuItem
from app.models.restaurant import Restaurant

def check_menu_data():
    db = SessionLocal()
    
    try:
        restaurants = db.query(Restaurant).all()
        print(f"Found {len(restaurants)} restaurants:")
        for r in restaurants:
            print(f"  - ID: {r.id}, Name: {r.name}")
        
        menus = db.query(Menu).all()
        print(f"\nFound {len(menus)} menus:")
        for m in menus:
            print(f"  - ID: {m.id}, Name: {m.name}, Restaurant ID: {m.restaurant_id}")
        
        categories = db.query(MenuCategory).all()
        print(f"\nFound {len(categories)} categories:")
        for c in categories:
            print(f"  - ID: {c.id}, Name: {c.name}, Menu ID: {c.menu_id}")
        
        items = db.query(MenuItem).all()
        print(f"\nFound {len(items)} menu items:")
        for i in items:
            print(f"  - ID: {i.id}, Name: {i.name}, Menu ID: {i.menu_id}, Category ID: {i.category_id}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_menu_data()
