from app import db
from app.models import Restaurant
import json

with open('restaurant.json') as data_file:
    data = json.load(data_file)

for item in data["restaurant"]["restaurants"]:
    name = item["name"]
    address = item["address"]
    restaurant = Restaurant(name=name, address=address)
    db.session.add(restaurant)

db.session.commit()