-- Starting content for a fresh database. Safe to run again: existing rows are left alone.

insert into products (id, name, size, volume_ml, price, description, badge, image, in_stock, sort) values
  ('500ml', 'Gid''s Apple Cider Vinegar', '500 ml', 500, 105, 'Raw, unfiltered apple cider vinegar with the mother culture. Cold-pressed and handcrafted in Cape Coast, Ghana.', 'Most Popular', '/images/products/bottle-500ml.jpg', true, 0),
  ('1000ml', 'Gid''s Apple Cider Vinegar', '1000 ml', 1000, 170, 'Family size. Ideal for daily cooking and wellness routines. Same premium quality, more for your money.', 'Best Value', '/images/products/bottle-1000ml.jpg', true, 1),
  ('250ml', 'Gid''s Apple Cider Vinegar', '250 ml', 250, 60, 'A small bottle to try our raw, unfiltered apple cider vinegar with the mother culture.', 'Starter', '/images/products/bottle-500ml.jpg', true, 2),
  ('750ml', 'Gid''s Apple Cider Vinegar', '750 ml', 750, 135, 'A mid-size bottle for weekly use in cooking, dressings and your daily wellness routine.', null, '/images/products/bottle-500ml.jpg', true, 3),
  ('2000ml', 'Gid''s Apple Cider Vinegar', '2 L', 2000, 310, 'A large container for busy kitchens and regular users. The same raw, unfiltered quality.', 'Bulk', '/images/products/bottle-1000ml.jpg', true, 4),
  ('gift-set', 'Gid''s Apple Cider Vinegar', 'Gift Set', 1000, 240, 'Two bottles presented together, ready to give to someone who cares about natural health.', 'Gift', '/images/products/bottle-1000ml.jpg', true, 5)
on conflict (id) do nothing;

insert into settings (id, trade_email, whatsapp_number, phone, address) values (1, 'trade@gbhpl.com', '+233507154818', '+233507154818', 'Cape Coast, Central Region, Ghana')
on conflict (id) do nothing;

insert into founder (id, name, title, bio, quote, photo_path) values (1, 'Gideon Hanson', 'Founder & CEO, GBHPL', 'Gideon founded Gid''s Beverages & Health Products Ltd with one goal: to produce the highest-quality, naturally-made health beverages in Ghana. Starting in a small facility in Cape Coast, he has grown the brand through an unwavering commitment to quality and transparency.', 'We don''t cut corners. Every bottle carries our name, and that means something to us.', '/founder/ceo.jpg')
on conflict (id) do nothing;
