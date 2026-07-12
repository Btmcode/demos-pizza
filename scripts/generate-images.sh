#!/bin/bash
# Demos Pizza image generation script
set -e
cd /home/z/my-project
mkdir -p public/images

echo "Generating Demos Pizza images..."

# Hero - 1344x768 (multiples of 32)
z-ai image -p "Overhead shot of authentic Neapolitan Margherita pizza on dark rustic wooden table, fresh basil leaves, melted mozzarella di bufala, San Marzano tomato sauce, charred crust from stone oven, moody cinematic lighting, professional food photography, steam rising, ultra detailed, appetizing" -o "/home/z/my-project/public/images/hero-pizza.png" -s 1344x768 2>&1 | tail -2

z-ai image -p "Traditional Italian stone-fired pizza oven with glowing orange flames and embers inside, pizza cooking on stone surface, dark dramatic ambiance, fire light reflecting, professional food photography, cinematic" -o "/home/z/my-project/public/images/stone-oven.png" -s 1344x768 2>&1 | tail -2

z-ai image -p "Fresh pizza ingredients flat lay on dark slate, ripe San Marzano tomatoes, fresh basil, mozzarella di bufala balls, olive oil bottle, garlic, flour, dramatic side lighting, top-down professional food photography" -o "/home/z/my-project/public/images/ingredients.png" -s 1344x768 2>&1 | tail -2

z-ai image -p "Cozy modern Italian pizzeria interior with warm lighting, exposed brick walls, wooden tables, hanging Edison bulbs, plants, open kitchen with stone oven visible in background, inviting ambiance, professional interior photography" -o "/home/z/my-project/public/images/restaurant-interior.png" -s 1344x768 2>&1 | tail -2

# Pizza cards - 1024x1024
z-ai image -p "Gourmet prosciutto e burrata pizza, thin crust topped with fresh arugula, prosciutto di parma, creamy burrata cheese, cherry tomatoes, balsamic glaze drizzle, on marble surface, elegant fine dining presentation, professional food photography, top view" -o "/home/z/my-project/public/images/pizza-prosciutto.png" -s 1024x1024 2>&1 | tail -2

z-ai image -p "Luxury black truffle pizza with shaved tartufo nero, melted fontina cheese, golden crispy crust, drizzled with truffle oil, on black slate plate, moody luxury restaurant lighting, professional food photography, top view" -o "/home/z/my-project/public/images/pizza-tartufo.png" -s 1024x1024 2>&1 | tail -2

z-ai image -p "Classic pepperoni pizza with crispy curled pepperoni cups, melted mozzarella, tomato sauce, golden brown crust, on wooden board, warm appetizing lighting, professional food photography, top view" -o "/home/z/my-project/public/images/pizza-pepperoni.png" -s 1024x1024 2>&1 | tail -2

z-ai image -p "Turkish-inspired pizza pide with sucuk (turkish sausage), kasar cheese, egg, parsley, on rustic wooden table, traditional Turkish bakery ambiance, professional food photography, top view" -o "/home/z/my-project/public/images/pizza-turkish.png" -s 1024x1024 2>&1 | tail -2

z-ai image -p "Quattro formaggi pizza with four cheeses mozzarella gorgonzola fontina parmesan, golden bubbly melted cheese, on dark ceramic plate, moody lighting, professional food photography, top view" -o "/home/z/my-project/public/images/pizza-quattro.png" -s 1024x1024 2>&1 | tail -2

z-ai image -p "Fresh vegetarian pizza with colorful bell peppers, mushrooms, olives, red onions, sweet corn, melted mozzarella, on wooden serving board, bright natural lighting, professional food photography, top view" -o "/home/z/my-project/public/images/pizza-vegetarian.png" -s 1024x1024 2>&1 | tail -2

echo "ALL_IMAGES_DONE"
ls -la /home/z/my-project/public/images/
