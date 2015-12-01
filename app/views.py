from flask import render_template, request
import datetime
from app import app, db
from app.models import MenuItem, Orders, Restaurant, Suggestions

@app.route('/')
@app.route('/index')
def index():
    user = {'nickname': 'Saurabh Sinha'}  # fake user, 411 prof.
    restaurant = {'name': 'MIGA'}
    menu = MenuItem.query.all()
    return render_template('index.html',
                           title='Home',
                           user=user,
                           restaurant=restaurant,
                           menu=menu)

@app.route('/submit_order')
def submit_order():
    order = Orders()
    order.time = datetime.datetime.now()
    restaurant_name = request.args.get('restaurant') #TODO add restaurant argument in submitted order
    for item in request.args.getlist('array[]'):
        menuItem = MenuItem.query.filter_by(name=item).first()
        item_id = menuItem.id
        for paired_item in request.args.getlist('array[]'):
            if item != paired_item:
                paired_item_id = MenuItem.query.filter_by(name=paired_item).first().id
                suggestionPair = Suggestions.query.filter_by(current_id=item_id, next_id=paired_item_id).first()
                new_weight = suggestionPair.weight + 1
                suggestionPair.weight = new_weight
        print(menuItem.name)
        order.items.append(menuItem)
    db.session.add(order)
    restaurant = Restaurant.query.filter_by(name='MIGA').first()
    restaurant.orders.append(order)
    db.session.commit()
    return index()

@app.route('/view_orders')
def view_orders():
    restaurant = {'name': 'MIGA'}
    orders = Orders.query.all()
    return render_template('orders.html',
                           orders=orders,
                           restaurant=restaurant)

# Orders.query.get(id) should return a order object
# which should then get deleted upon the .delete()
@app.route('/del_orderItem')
def del_orderItem():
    id = request.args.get('id')
    delItem = Orders.query.get(id)
    db.session.delete(delItem)
    db.session.commit()
    return view_orders()

@app.route('/update_order')
def update_order():
    orderid = request.args.get('id')
    currOrder = Orders.query.get(orderid)
    for item in request.args.getlist('array[]'):
        menuitem = MenuItem.query.filter_by(name=item).first()
        currOrder.items.append(menuitem)
    db.session.commit()
    return index()
    # get orderr
    # add items like the other one adds items to a new order

@app.route('/dashboard')
def dashboard():
    restaurant = request.args.get('restaurant')
    common_items = MenuItem.query.filter_by(restaurant=Restaurant.query.filter_by(name=restaurant).first()).order_by(MenuItem.frequency.desc())
    popular_items = db.query(db.cast(MenuItem.rating_sum/MenuItem.frequency, db.Integer))
    popular_items = popular_items.order_by(popular_items.desc())  #Should probably do something like a view or as here
    return render_template('dashboard.html',
                           common_items=common_items,
                           popular_items=popular_items)

