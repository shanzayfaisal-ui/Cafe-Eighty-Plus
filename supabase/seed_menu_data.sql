-- ===========================================
-- MENU DATA INSERTION FOR CAFE EIGHTY PLUS
-- Run these queries in Supabase SQL Editor
-- ===========================================

-- First, insert menu categories
INSERT INTO public.menu_categories (name, cartable, display_order) VALUES
('Hot Coffee', true, 1),
('Cold Coffee', true, 2),
('Pastries', true, 3),
('Sandwiches', true, 4),
('Desserts', true, 5),
('Beverages', true, 6);

-- Insert menu items for Hot Coffee category
INSERT INTO public.menu_items (category_id, name, description, price, price_num, image_key, display_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee'), 'Espresso', 'Rich and bold single shot espresso', 'Rs. 180', 180, 'espresso', 1),
((SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee'), 'Americano', 'Espresso diluted with hot water', 'Rs. 220', 220, 'americano', 2),
((SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee'), 'Cappuccino', 'Espresso with steamed milk and foam', 'Rs. 280', 280, 'cappuccino', 3),
((SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee'), 'Latte', 'Espresso with steamed milk', 'Rs. 300', 300, 'latte', 4),
((SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee'), 'Mocha', 'Espresso with chocolate and steamed milk', 'Rs. 320', 320, 'mocha', 5),
((SELECT id FROM public.menu_categories WHERE name = 'Hot Coffee'), 'Macchiato', 'Espresso with a dollop of foam', 'Rs. 260', 260, 'macchiato', 6);

-- Insert menu items for Cold Coffee category
INSERT INTO public.menu_items (category_id, name, description, price, price_num, image_key, display_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Cold Coffee'), 'Iced Americano', 'Cold brewed americano over ice', 'Rs. 240', 240, 'iced-americano', 1),
((SELECT id FROM public.menu_categories WHERE name = 'Cold Coffee'), 'Iced Latte', 'Espresso with cold milk over ice', 'Rs. 320', 320, 'iced-latte', 2),
((SELECT id FROM public.menu_categories WHERE name = 'Cold Coffee'), 'Cold Brew', 'Slow-steeped cold coffee', 'Rs. 280', 280, 'cold-brew', 3),
((SELECT id FROM public.menu_categories WHERE name = 'Cold Coffee'), 'Frappuccino', 'Blended iced coffee drink', 'Rs. 350', 350, 'frappuccino', 4),
((SELECT id FROM public.menu_categories WHERE name = 'Cold Coffee'), 'Nitro Cold Brew', 'Nitrogen-infused cold brew', 'Rs. 300', 300, 'nitro-cold-brew', 5);

-- Insert menu items for Pastries category
INSERT INTO public.menu_items (category_id, name, description, price, price_num, image_key, display_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Pastries'), 'Croissant', 'Buttery, flaky French pastry', 'Rs. 150', 150, 'croissant', 1),
((SELECT id FROM public.menu_categories WHERE name = 'Pastries'), 'Blueberry Muffin', 'Fresh baked muffin with blueberries', 'Rs. 180', 180, 'blueberry-muffin', 2),
((SELECT id FROM public.menu_categories WHERE name = 'Pastries'), 'Chocolate Chip Cookie', 'Chewy cookie with chocolate chips', 'Rs. 120', 120, 'chocolate-chip-cookie', 3),
((SELECT id FROM public.menu_categories WHERE name = 'Pastries'), 'Danish Pastry', 'Sweet pastry with fruit filling', 'Rs. 200', 200, 'danish-pastry', 4),
((SELECT id FROM public.menu_categories WHERE name = 'Pastries'), 'Scone', 'Traditional English scone', 'Rs. 160', 160, 'scone', 5);

-- Insert menu items for Sandwiches category
INSERT INTO public.menu_items (category_id, name, description, price, price_num, image_key, display_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Sandwiches'), 'BLT Sandwich', 'Bacon, lettuce, and tomato classic', 'Rs. 350', 350, 'blt-sandwich', 1),
((SELECT id FROM public.menu_categories WHERE name = 'Sandwiches'), 'Club Sandwich', 'Triple-decker with turkey, bacon, and veggies', 'Rs. 420', 420, 'club-sandwich', 2),
((SELECT id FROM public.menu_categories WHERE name = 'Sandwiches'), 'Grilled Cheese', 'Melted cheese between toasted bread', 'Rs. 280', 280, 'grilled-cheese', 3),
((SELECT id FROM public.menu_categories WHERE name = 'Sandwiches'), 'Turkey Club', 'Turkey, bacon, lettuce, and tomato', 'Rs. 380', 380, 'turkey-club', 4),
((SELECT id FROM public.menu_categories WHERE name = 'Sandwiches'), 'Veggie Wrap', 'Fresh vegetables in a tortilla wrap', 'Rs. 320', 320, 'veggie-wrap', 5);

-- Insert menu items for Desserts category
INSERT INTO public.menu_items (category_id, name, description, price, price_num, image_key, display_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Desserts'), 'Tiramisu', 'Classic Italian coffee-flavored dessert', 'Rs. 280', 280, 'tiramisu', 1),
((SELECT id FROM public.menu_categories WHERE name = 'Desserts'), 'Cheesecake', 'Creamy New York style cheesecake', 'Rs. 250', 250, 'cheesecake', 2),
((SELECT id FROM public.menu_categories WHERE name = 'Desserts'), 'Chocolate Cake', 'Rich chocolate layer cake', 'Rs. 220', 220, 'chocolate-cake', 3),
((SELECT id FROM public.menu_categories WHERE name = 'Desserts'), 'Apple Pie', 'Warm apple pie with cinnamon', 'Rs. 200', 200, 'apple-pie', 4),
((SELECT id FROM public.menu_categories WHERE name = 'Desserts'), 'Ice Cream Sundae', 'Vanilla ice cream with toppings', 'Rs. 180', 180, 'ice-cream-sundae', 5);

-- Insert menu items for Beverages category
INSERT INTO public.menu_items (category_id, name, description, price, price_num, image_key, display_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'Beverages'), 'Fresh Orange Juice', 'Freshly squeezed orange juice', 'Rs. 150', 150, 'orange-juice', 1),
((SELECT id FROM public.menu_categories WHERE name = 'Beverages'), 'Green Tea', 'Traditional green tea', 'Rs. 120', 120, 'green-tea', 2),
((SELECT id FROM public.menu_categories WHERE name = 'Beverages'), 'Herbal Tea', 'Caffeine-free herbal infusion', 'Rs. 130', 130, 'herbal-tea', 3),
((SELECT id FROM public.menu_categories WHERE name = 'Beverages'), 'Hot Chocolate', 'Rich chocolate drink', 'Rs. 180', 180, 'hot-chocolate', 4),
((SELECT id FROM public.menu_categories WHERE name = 'Beverages'), 'Smoothie', 'Fresh fruit smoothie', 'Rs. 200', 200, 'smoothie', 5);