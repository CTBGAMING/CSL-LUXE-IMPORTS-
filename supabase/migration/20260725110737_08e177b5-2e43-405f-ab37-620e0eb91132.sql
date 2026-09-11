
-- Clear placeholder products and seed real CSL Luxe catalog
DELETE FROM public.products;

INSERT INTO public.products (name, description, price, category, image_url, in_stock) VALUES
('Eternity Cuban Chain', 'Hand-polished 925 sterling silver Cuban link — bold, weighted, timeless.', 4200, '925 Silver', 'seed/p1.jpg', true),
('Monolith Signet Ring', 'Brushed 925 sterling silver signet with a matte, engravable face.', 1850, '925 Silver', 'seed/p2.jpg', true),
('Onyx Rope Bracelet', 'Precision-woven stainless steel rope bracelet with locking clasp.', 1350, 'Stainless Steel', 'seed/p3.jpg', true),
('Iced Medallion Pendant', 'Fully iced stainless steel medallion on Cuban link — full brilliance.', 2950, 'Stainless Steel', 'seed/p4.jpg', true),
('Noir Skeleton Automatic', 'Custom automatic skeleton timepiece — exposed movement, black strap.', 12500, 'Watches', 'seed/p5.jpg', true),
('Silver Chronograph Classic', 'Silver-cased chronograph with hand-stitched leather — quiet confidence.', 8900, 'Watches', 'seed/p6.jpg', true);
