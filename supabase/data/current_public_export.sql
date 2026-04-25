-- =====================================================
-- Cafe Eighty Plus public data export from the previous Supabase project
-- Source: https://fvtnzndwstxrvaacgrwb.supabase.co
-- Exported at: 2026-03-30T22:31:20.368Z
-- Run AFTER the schema/bootstrap SQL on the new project.
-- =====================================================

BEGIN;

-- Data for public.menu_categories
INSERT INTO public.menu_categories (id, name, cartable, display_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Hot Coffee', FALSE, 1),
  ('22222222-2222-2222-2222-222222222222', 'Iced Coffee', FALSE, 2),
  ('33333333-3333-3333-3333-333333333333', 'Frappes', FALSE, 3),
  ('44444444-4444-4444-4444-444444444444', 'Smoothies', FALSE, 4),
  ('55555555-5555-5555-5555-555555555555', 'Sweet & Baked', FALSE, 5),
  ('66666666-6666-6666-6666-666666666666', 'Savory Snacks', FALSE, 6),
  ('77777777-7777-7777-7777-777777777777', 'Coffee Beans', TRUE, 7),
  ('88888888-8888-8888-8888-888888888888', 'Merchandise', TRUE, 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    cartable = EXCLUDED.cartable,
    display_order = EXCLUDED.display_order;

-- Data for public.menu_items
INSERT INTO public.menu_items (id, category_id, name, description, price, price_num, image_key, display_order)
VALUES
  ('ab98ac39-a4bc-455d-8d09-8b6ea0bb2d8f', '55555555-5555-5555-5555-555555555555', 'Walnut Brownie', 'Rich chocolate brownie topped with crunchy walnuts.', 'Rs. 650', 650, 'walnut_brownie', 1),
  ('98a51a1e-0c6d-4ce5-93c9-d1201132af68', '11111111-1111-1111-1111-111111111111', 'Espresso', 'Rich, bold shot of pure espresso with a smooth crema.', 'Rs. 510', 510, 'espresso', 1),
  ('44121722-8231-44dd-8b46-646805f322c9', '77777777-7777-7777-7777-777777777777', 'House Blend 250g', 'Medium roasted blend for smooth, balanced coffee.', 'Rs. 1800', 1800, 'house_blend', 1),
  ('8313c229-2e37-4c32-ae99-dff3a5a76331', '22222222-2222-2222-2222-222222222222', 'Iced Americano', 'Chilled espresso diluted with water, crisp and refreshing.', 'Rs. 530', 530, 'americano_cold', 1),
  ('1d0e7745-ddfe-47b0-9292-00833a358db9', '66666666-6666-6666-6666-666666666666', 'Grilled Chicken Sandwich', 'Toasty sandwich with grilled chicken and fresh veggies.', 'Rs. 900', 900, 'sandwich', 1),
  ('ffa88c9e-7563-44cb-b504-cc4f339e5d48', '44444444-4444-4444-4444-444444444444', 'Banana & Strawberry', 'Creamy banana and fresh strawberry smoothie.', 'Rs. 1050', 1050, 'banana_strawberry', 1),
  ('c2584388-4746-4078-8e16-535fb2dd1309', '33333333-3333-3333-3333-333333333333', 'Mocha Frappe', 'Blended iced coffee with chocolatey goodness.', 'Rs. 950', 950, 'mocha_frappe', 1),
  ('2d1dbdaa-addf-44bf-995e-47987605cdd3', '88888888-8888-8888-8888-888888888888', 'Ceramic Mug', 'Elegant mug for enjoying your favorite coffee.', 'Rs. 1200', 1200, 'mug', 1),
  ('81173323-0ff1-4f81-89e8-e1534d7d1803', '66666666-6666-6666-6666-666666666666', 'Chicken Tikka Bites', 'Spicy chicken tikka pieces, perfect as a snack.', 'Rs. 850', 850, 'tikka_bites', 2),
  ('ddacb367-7ad9-48a6-be4c-adcdc7f8fae4', '33333333-3333-3333-3333-333333333333', 'Matcha Frappe', 'Iced, blended matcha latte with creamy texture.', 'Rs. 1050', 1050, 'matcha_frappe', 2),
  ('2a9d471a-2a54-434c-855e-f593e5bea24c', '11111111-1111-1111-1111-111111111111', 'Macchiato', 'Espresso topped with a small amount of frothy milk.', 'Rs. 550', 550, 'macchiato', 2),
  ('3c299518-e6b8-4e73-b616-c86512279f4b', '88888888-8888-8888-8888-888888888888', 'Travel Tumbler', 'Portable tumbler to enjoy coffee on the go.', 'Rs. 1800', 1800, 'tumbler', 2),
  ('98d579c9-f7f8-4d14-826b-f49160c6b728', '77777777-7777-7777-7777-777777777777', 'Single Origin Ethiopia', 'Premium Ethiopian beans with floral notes.', 'Rs. 2000', 2000, 'ethiopia', 2),
  ('fdeac588-2dae-4d17-98c8-707d6191ebb2', '55555555-5555-5555-5555-555555555555', 'Ferrero Rocher Brownie', 'Chocolatey brownie with Ferrero Rocher pieces.', 'Rs. 700', 700, 'ferrero_brownie', 2),
  ('9659826d-8ad4-40ae-84f4-2d0ff1fb377f', '22222222-2222-2222-2222-222222222222', 'Iced Long Black', 'Strong espresso over ice with bold, aromatic flavor.', 'Rs. 530', 530, 'long_black_cold', 2),
  ('2780e877-a490-47da-83f2-9627260bd321', '44444444-4444-4444-4444-444444444444', 'Mix Berries', 'Smoothie blended with a mix of juicy berries.', 'Rs. 950', 950, 'mixed_berries', 2),
  ('d24655b5-49f5-4c93-98ae-c4d2e5a1c117', '66666666-6666-6666-6666-666666666666', 'Loaded Fries', 'Crispy fries topped with cheese, sauces, and toppings.', 'Rs. 700', 700, 'loaded_fries', 3),
  ('56027ce1-0332-4784-92a5-c3bc033d11f3', '88888888-8888-8888-8888-888888888888', 'Canvas Tote', 'Stylish tote bag for daily use and coffee runs.', 'Rs. 1000', 1000, 'tote', 3),
  ('19a8736b-4657-45c4-898f-31d926ca3ef8', '22222222-2222-2222-2222-222222222222', 'Iced Latte', 'Cold espresso mixed with chilled milk over ice.', 'Rs. 750', 750, 'latte_cold', 3),
  ('feb374d3-25a6-468c-aff7-607e479ced0e', '11111111-1111-1111-1111-111111111111', 'Americano', 'Smooth espresso diluted with hot water for a mellow taste.', 'Rs. 510', 510, 'americano', 3),
  ('2734b4b0-c4d6-4384-a36c-367e83658728', '77777777-7777-7777-7777-777777777777', 'Colombian Supremo', 'High-quality Colombian beans with rich flavor.', 'Rs. 1900', 1900, 'colombia', 3),
  ('e328886a-dd39-4dbd-9d69-9eddefbf2013', '33333333-3333-3333-3333-333333333333', 'Cookies & Cream Frappe', 'Blended frappe with cookies and cream flavor.', 'Rs. 950', 950, 'cookies_cream', 3),
  ('dd50a0a7-fa99-4775-87c4-b777e81f62d4', '55555555-5555-5555-5555-555555555555', 'Three Milk (Lotus)', 'Soft cake soaked in three kinds of milk with Lotus flavor.', 'Rs. 750', 750, 'three_milk', 3),
  ('9159b770-d772-4f2d-8910-1dfb5fbe1ce6', '44444444-4444-4444-4444-444444444444', 'Natural Kick', 'Healthy smoothie with natural fruits and energy boost.', 'Rs. 900', 900, 'natural_kick', 3),
  ('c17a6b50-0574-4082-b608-919bc18c9d34', '88888888-8888-8888-8888-888888888888', 'Brew Kit', 'Complete kit to brew coffee at home like a pro.', 'Rs. 5000', 5000, 'brew_kit', 4),
  ('2582493c-6cce-4abb-bb29-bd554596dc02', '11111111-1111-1111-1111-111111111111', 'Long Black', 'Strong espresso with hot water, bold and aromatic.', 'Rs. 510', 510, 'long_black', 4),
  ('eead0a29-bb29-4e1e-950f-6158331f0545', '22222222-2222-2222-2222-222222222222', 'Iced Flavored Latte', 'Iced latte with your choice of delicious flavors.', 'Rs. 800', 800, 'flavored_latte_cold', 4),
  ('ef984483-f8ad-405b-b8c8-0d56acef3666', '33333333-3333-3333-3333-333333333333', 'Peach Ice', 'Refreshing peach-flavored blended ice drink.', 'Rs. 580', 580, 'peach_ice', 4),
  ('46283a27-08c0-48d3-ac9f-46616a43967f', '55555555-5555-5555-5555-555555555555', 'Banana Walnut Bread', 'Moist banana bread with crunchy walnut bits.', 'Rs. 600', 600, 'banana_bread', 4),
  ('8dfca14b-f16c-4bd2-8dbc-7db1b793950b', '66666666-6666-6666-6666-666666666666', 'Samosa (2 pcs)', 'Golden, crispy samosas with savory filling.', 'Rs. 300', 300, 'samosa', 4),
  ('a58b6670-65f4-4964-b86a-29dcb26a5de2', '77777777-7777-7777-7777-777777777777', 'Dark Roast 250g', 'Bold dark roasted coffee beans for strong brews.', 'Rs. 1700', 1700, 'dark_roast', 4),
  ('9ca3a80e-4965-43f1-a9cf-34663c18318d', '66666666-6666-6666-6666-666666666666', 'Chicken Samosa (2 pcs)', 'Crispy samosas stuffed with spiced chicken.', 'Rs. 350', 350, 'chicken_samosa', 5),
  ('63262fe8-3f66-45a1-922b-5736d3c3b82f', '33333333-3333-3333-3333-333333333333', 'Lemon Ice', 'Citrusy blended ice drink with zesty lemon flavor.', 'Rs. 580', 580, 'lemon_ice', 5),
  ('6a9e8b86-1c05-402c-9e99-095485353fac', '22222222-2222-2222-2222-222222222222', 'Iced Cappuccino', 'Espresso with cold milk and frothy ice topping.', 'Rs. 860', 860, 'cappuccino_cold', 5),
  ('b4cb8e23-890c-46e0-81ab-40e2271886ea', '77777777-7777-7777-7777-777777777777', 'Espresso Blend 500g', 'Special blend roasted for perfect espresso shots.', 'Rs. 3200', 3200, 'espresso_blend', 5),
  ('60b1a42a-1345-49b4-9acc-40f8bb4fca07', '11111111-1111-1111-1111-111111111111', 'Cortado', 'Espresso cut with equal parts warm milk for balance.', 'Rs. 580', 580, 'cortado', 5),
  ('f2780d52-ada3-4262-9ab0-7d9ebdf70e11', '55555555-5555-5555-5555-555555555555', 'Choco Chip Cookie', 'Classic cookie loaded with chocolate chips.', 'Rs. 400', 400, 'cookie', 5),
  ('f4333153-da42-4583-a7c4-7891163c346b', '33333333-3333-3333-3333-333333333333', 'Raspberry Ice', 'Sweet and tangy raspberry blended ice beverage.', 'Rs. 580', 580, 'raspberry_ice', 6),
  ('84288fdc-7f15-4c82-ace0-86d69b5babad', '22222222-2222-2222-2222-222222222222', 'Iced Spanish Latte', 'Sweet cold latte with espresso and condensed milk.', 'Rs. 800', 800, 'spanish_latte_cold', 6),
  ('a72fbbdc-c81e-410f-8497-b8f200e1bdf3', '11111111-1111-1111-1111-111111111111', 'Flat White', 'Velvety espresso drink with steamed milk and silky microfoam.', 'Rs. 700', 700, 'flat_white', 6),
  ('e0918b68-5321-460e-a614-ac2b9199fc0f', '55555555-5555-5555-5555-555555555555', 'Chocolate Peanut Bar', 'Sweet chocolate bar with crunchy peanuts.', 'Rs. 450', 450, 'peanut_bar', 6),
  ('9ddd3ff4-b38f-4e33-bbd1-84ddbbf11466', '22222222-2222-2222-2222-222222222222', 'Iced Lotus Biscoff', 'Chilled latte infused with Lotus Biscoff syrup.', 'Rs. 780', 780, 'lotus_cold', 7),
  ('a71f18a9-66e5-487e-bd99-329da7d14454', '11111111-1111-1111-1111-111111111111', 'Latte', 'Creamy espresso latte topped with smooth milk foam.', 'Rs. 720', 720, 'latte', 7),
  ('736f72a5-77cb-49b4-a589-7153a6ab624a', '55555555-5555-5555-5555-555555555555', 'Chocolate Crunch Bar', 'Chocolate bar with a crispy, crunchy texture.', 'Rs. 450', 450, 'crunch_bar', 7),
  ('cca63482-8ed2-4270-8d79-6962a7056627', '11111111-1111-1111-1111-111111111111', 'Flavored Latte', 'Latte infused with your choice of delicious flavors.', 'Rs. 760', 760, 'flavored_latte', 8),
  ('52c2901b-26fd-48e8-a9fa-f51ee94229dc', '55555555-5555-5555-5555-555555555555', 'Roasted Hazelnut Bar', 'Nutty chocolate bar with roasted hazelnuts.', 'Rs. 450', 450, 'hazelnut_bar', 8),
  ('261aa790-f689-4353-8d7a-656f005636c4', '22222222-2222-2222-2222-222222222222', 'Iced Peanut Butter', 'Iced espresso latte blended with creamy peanut butter.', 'Rs. 840', 840, 'peanut_butter_cold', 8),
  ('35d06b63-2528-49a2-a9cb-631c8bf7634a', '55555555-5555-5555-5555-555555555555', 'Chicken Bread Bun', 'Savory bun stuffed with flavorful chicken filling.', 'Rs. 500', 500, 'bread_bun', 9),
  ('bd79ec59-512c-4d33-91d1-a0def6e7ed67', '22222222-2222-2222-2222-222222222222', 'Iced Honey Latte', 'Cold latte sweetened naturally with honey.', 'Rs. 840', 840, 'honey_cold', 9),
  ('26c1ddc1-0061-4126-bd67-a2e333db0139', '11111111-1111-1111-1111-111111111111', 'Cappuccino', 'Classic espresso with steamed milk and light foam topping.', 'Rs. 820', 820, 'cappuccino', 9),
  ('644657e6-a0cf-43c0-a817-993f0fef0eb2', '11111111-1111-1111-1111-111111111111', 'Spanish Latte', 'Sweet espresso latte with a touch of condensed milk.', 'Rs. 720', 720, 'spanish_latte', 10),
  ('7d43bd98-1770-4bfa-901f-320818db82c6', '22222222-2222-2222-2222-222222222222', 'Iced Mocha', 'Chocolatey iced espresso with milk and ice.', 'Rs. 780', 780, 'mocha_cold', 10),
  ('3e55446f-0224-4c2b-8875-c17822294930', '22222222-2222-2222-2222-222222222222', 'Iced Honey Mocha', 'Sweet iced mocha with a touch of honey.', 'Rs. 850', 850, 'iced_honey_mocha', 11),
  ('b6161b62-e726-4ef4-8929-be725667c1c7', '11111111-1111-1111-1111-111111111111', 'Lotus Biscoff Latte', 'Espresso latte with smooth Lotus Biscoff flavor.', 'Rs. 750', 750, 'lotus', 11),
  ('494c4082-a0d8-4834-bf6d-5196e7abea69', '11111111-1111-1111-1111-111111111111', 'Peanut Butter Latte', 'Espresso latte blended with creamy peanut butter.', 'Rs. 800', 800, 'peanut_butter', 12),
  ('fa35c700-3302-4b9c-8ce9-3a9c7cf185c4', '22222222-2222-2222-2222-222222222222', 'Iced Chocolate', 'Chilled rich chocolate drink over ice.', 'Rs. 900', 900, 'iced_chocolate', 12),
  ('a5cee658-7025-4f29-b5be-c44b796e5a26', '22222222-2222-2222-2222-222222222222', 'Iced Matcha', 'Refreshing iced green tea latte with matcha.', 'Rs. 800', 800, 'matcha_cold', 13),
  ('05c0617f-56c7-4f53-9c1e-ac758bf24590', '11111111-1111-1111-1111-111111111111', 'Honey Latte', 'Sweet and comforting latte infused with honey.', 'Rs. 800', 800, 'honey_latte', 13),
  ('e0e22e73-cc21-4bf0-a23c-24290fb5a8ee', '22222222-2222-2222-2222-222222222222', 'Strawberry Matcha', 'Iced matcha latte with fresh strawberry flavor.', 'Rs. 800', 800, 'strawberry_matcha', 14),
  ('3f6db61c-556b-47d9-9548-06a708be77b3', '11111111-1111-1111-1111-111111111111', 'Mocha', 'Chocolate-infused espresso drink with creamy milk.', 'Rs. 760', 760, 'mocha', 14),
  ('fb5375ba-9e82-4e21-b616-f32482e973ae', '22222222-2222-2222-2222-222222222222', 'Affogato', 'Cold espresso poured over creamy vanilla ice cream.', 'Rs. 1050', 1050, 'affogato', 15),
  ('cb8a940d-8724-43e5-88a5-f89dcb283458', '11111111-1111-1111-1111-111111111111', 'Hot Chocolate', 'Rich, velvety chocolate drink, perfect for warmth.', 'Rs. 800', 800, 'hot_chocolate', 15),
  ('c90d348e-0bd2-46df-b476-f4efa3304412', '11111111-1111-1111-1111-111111111111', 'Matcha', 'Smooth green tea latte with earthy matcha flavor.', 'Rs. 700', 700, 'matcha', 16)
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    price_num = EXCLUDED.price_num,
    image_key = EXCLUDED.image_key,
    display_order = EXCLUDED.display_order;

-- Data for public.best_sellers
INSERT INTO public.best_sellers (id, name, price, image_key, rating, display_order)
VALUES
  ('4706fc29-f5bd-4288-a753-29686b439371', 'Latte', 'Rs. 720', 'latte', 4.7, 1),
  ('905c92f7-808b-4587-b7e2-d01efdf6066f', 'Cappuccino', 'Rs. 860', 'cappuccino', 4.8, 2),
  ('d04fbe23-3cee-42af-a1ac-038bc8de1a92', 'Mocha', 'Rs. 760', 'mocha', 4.6, 3),
  ('03e1119b-bcbb-4270-987d-adc38f9fdcdf', 'Peach ice', 'Rs. 580', 'peach_ice', 4.9, 4),
  ('168518b8-e213-4b12-a57b-9d30edce70d1', 'Cookies & Cream Frappe', 'Rs. 950', 'cookies_cream', 4.8, 5),
  ('8c43aced-7c8f-4bd6-979e-36e2b4fd459f', 'Brownie', 'Rs. 500', 'brownie', 4.7, 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    image_key = EXCLUDED.image_key,
    rating = EXCLUDED.rating,
    display_order = EXCLUDED.display_order;

-- Data for public.gallery
INSERT INTO public.gallery (id, title, image_url, display_order)
VALUES
  ('772a3e27-c12c-4f6f-ac14-93df39511d69', 'Gallery 1', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery1.jpeg', 1),
  ('e9be7c67-aa07-4b30-a6ce-1ea99db3a062', 'Gallery 2', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery2.jpeg', 2),
  ('7dd6da26-b86b-42c2-ba9b-1b9ca04970bd', 'Gallery 3', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery3.jpeg', 3),
  ('293f6a7f-5fa6-4cd0-9b34-aa3ef1d89bbf', 'Gallery 4', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery4.jpeg', 4),
  ('b4c61a76-c2e2-4aeb-8606-1fc7b2651baa', 'Gallery 5', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery5.jpeg', 5),
  ('ff760c14-f93a-4640-b8e7-6cf3f6149c4b', 'Gallery 6', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery%206.jpg', 6),
  ('c0d6e982-830e-4a62-b992-5282f55f1678', 'Gallery 7', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery%207.jpg', 7),
  ('438e640c-23e3-451a-9ebc-90c298e78530', 'Gallery 8', 'https://fvtnzndwstxrvaacgrwb.supabase.co/storage/v1/object/public/Gallery/gallery%208%20(2).jpg', 8)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    image_url = EXCLUDED.image_url,
    display_order = EXCLUDED.display_order;

-- Data for public.coffee_guide
INSERT INTO public.coffee_guide (id, name, description, ratio, milk, strength, image_key, layers, display_order)
VALUES
  ('785041fe-8a26-445f-a768-3ed1e7068dde', 'Espresso', 'A concentrated shot of coffee with a bold flavor and rich crema.', '1:2', 'No Milk', 'Strong', 'espresso', '[{"pct":100,"color":"bg-amber-900","label":"Espresso"}]'::jsonb, 1),
  ('ab67751c-f94b-4eb9-b3b4-20158d496dcd', 'Latte', 'A smooth and creamy coffee with a higher ratio of milk.', '1:3', 'High', 'Mild', 'latte', '[{"pct":20,"color":"bg-amber-900","label":"Espresso"},{"pct":70,"color":"bg-amber-200","label":"Steamed Milk"},{"pct":10,"color":"bg-amber-100","label":"Foam"}]'::jsonb, 2),
  ('ee243647-3437-4286-b2e4-acd63b8676c7', 'Cappuccino', 'A balanced coffee with equal parts espresso, milk, and foam.', '1:1:1', 'Medium', 'Medium', 'cappuccino', '[{"pct":33,"color":"bg-amber-900","label":"Espresso"},{"pct":33,"color":"bg-amber-200","label":"Milk"},{"pct":34,"color":"bg-amber-100","label":"Foam"}]'::jsonb, 3),
  ('37844465-ca0a-4c96-ba59-4d9ee478e12f', 'Mocha', 'A chocolate-flavored coffee combining espresso, milk, and cocoa.', '1:2', 'Medium', 'Medium', 'mocha', '[{"pct":25,"color":"bg-amber-900","label":"Espresso"},{"pct":25,"color":"bg-brown-700","label":"Chocolate"},{"pct":40,"color":"bg-amber-200","label":"Milk"},{"pct":10,"color":"bg-amber-100","label":"Foam"}]'::jsonb, 4),
  ('2465308e-6130-4bce-aaae-802fd9102668', 'Americano', 'Hot water added to espresso for a lighter coffee.', '1:3', 'No Milk', 'Mild', 'americano', '[{"pct":30,"color":"bg-amber-900","label":"Espresso"},{"pct":70,"color":"bg-blue-200","label":"Water"}]'::jsonb, 5),
  ('3cf497e6-bbeb-4ab2-bd1e-8bdb69c5678e', 'Affogato', 'A delicious dessert coffee where hot espresso is poured over vanilla ice cream.', '1:1', 'Ice Cream', 'Mild', 'affogato', '[{"pct":70,"color":"bg-yellow-100","label":"Ice Cream"},{"pct":30,"color":"bg-amber-900","label":"Espresso"}]'::jsonb, 6),
  ('c6822017-2718-4a9d-9773-68b4325822c0', 'Flat White', 'A velvety coffee with espresso and finely textured microfoam milk.', '1:2', 'Medium', 'Strong', 'flat_white', '[{"pct":40,"color":"bg-amber-900","label":"Espresso"},{"pct":60,"color":"bg-amber-200","label":"Milk"}]'::jsonb, 7),
  ('445aabae-734b-49bd-b321-0f5f812ded62', 'Spanish Latte', 'A sweet and creamy latte made with condensed milk.', '1:3', 'High', 'Mild', 'spanish_latte', '[{"pct":25,"color":"bg-amber-900","label":"Espresso"},{"pct":25,"color":"bg-yellow-200","label":"Condensed Milk"},{"pct":50,"color":"bg-amber-200","label":"Milk"}]'::jsonb, 8),
  ('d9193b37-5636-4653-b82d-c9b848f023f4', 'Cortado', 'Equal parts espresso and warm milk to reduce acidity.', '1:1', 'Low', 'Strong', 'cortado', '[{"pct":50,"color":"bg-amber-900","label":"Espresso"},{"pct":50,"color":"bg-amber-200","label":"Milk"}]'::jsonb, 9)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    ratio = EXCLUDED.ratio,
    milk = EXCLUDED.milk,
    strength = EXCLUDED.strength,
    image_key = EXCLUDED.image_key,
    layers = EXCLUDED.layers,
    display_order = EXCLUDED.display_order;

-- Data for public.feedback
INSERT INTO public.feedback (name, rating, message, created_at)
VALUES
  ('Sabrina Farooq', 4, 'amazing', '2026-03-30T22:22:45.755056+00:00'),
  ('Alina Khan', 4, 'nice', '2026-03-28T18:07:26.019775+00:00'),
  ('Zara Ali', 4, 'welcoming', '2026-03-28T06:57:20.837443+00:00'),
  ('Alia Khan', 4, 'amazing', '2026-03-28T06:34:18.455676+00:00'),
  ('Alia Ali', 4, 'good', '2026-03-27T20:25:00.818268+00:00'),
  ('Test User', 5, 'This is a test feedback', '2026-03-26T21:49:50.442843+00:00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    rating = EXCLUDED.rating,
    message = EXCLUDED.message,
    created_at = EXCLUDED.created_at;

COMMIT;
