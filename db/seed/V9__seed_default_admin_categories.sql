BEGIN;

INSERT INTO product_category (name, slug, sort_order, created_at)
VALUES
    ('Rau củ', 'rau-cu', 5, NOW()),
    ('Trái cây', 'trai-cay', 20, NOW()),
    ('Sữa & đồ uống', 'sua-do-uong', 30, NOW()),
    ('Đồ khô', 'do-kho', 45, NOW()),
    ('Thực phẩm khác', 'thuc-pham-khac', 60, NOW())
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

COMMIT;
