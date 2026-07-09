-- Create Unit table
CREATE TABLE IF NOT EXISTS "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "symbol" TEXT,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for Unit table
CREATE INDEX IF NOT EXISTS "Unit_name_idx" ON "Unit"("name");
CREATE INDEX IF NOT EXISTS "Unit_isEnabled_idx" ON "Unit"("isEnabled");

-- Add unitId column to AuctionListing table
ALTER TABLE "AuctionListing" ADD COLUMN IF NOT EXISTS "unitId" TEXT;

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AuctionListing_unitId_fkey'
    ) THEN
        ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_unitId_fkey" 
        FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- Insert default units
INSERT INTO "Unit" ("id", "name", "nameEn", "symbol", "description", "isEnabled", "sortOrder") VALUES
('unit-kg', '千克', 'Kilogram', 'kg', '重量单位', true, 1),
('unit-g', '克', 'Gram', 'g', '重量单位', true, 2),
('unit-ton', '吨', 'Ton', 'ton', '重量单位', true, 3),
('unit-m', '米', 'Meter', 'm', '长度单位', true, 4),
('unit-cm', '厘米', 'Centimeter', 'cm', '长度单位', true, 5),
('unit-mm', '毫米', 'Millimeter', 'mm', '长度单位', true, 6),
('unit-m2', '平方米', 'Square Meter', 'm2', '面积单位', true, 7),
('unit-m3', '立方米', 'Cubic Meter', 'm3', '体积单位', true, 8),
('unit-liter', '升', 'Liter', 'L', '容积单位', true, 9),
('unit-pc', '件', 'Piece', 'pc', '数量单位', true, 10),
('unit-set', '套', 'Set', 'set', '数量单位', true, 11),
('unit-box', '箱', 'Box', 'box', '数量单位', true, 12),
('unit-bag', '袋', 'Bag', 'bag', '数量单位', true, 13),
('unit-roll', '卷', 'Roll', 'roll', '数量单位', true, 14),
('unit-pair', '对', 'Pair', 'pair', '数量单位', true, 15),
('unit-dozen', '打', 'Dozen', 'doz', '数量单位', true, 16),
('unit-yard', '码', 'Yard', 'yd', '长度单位', true, 17),
('unit-pound', '磅', 'Pound', 'lb', '重量单位', true, 18),
('unit-oz', '盎司', 'Ounce', 'oz', '重量单位', true, 19),
('unit-gallon', '加仑', 'Gallon', 'gal', '容积单位', true, 20)
ON CONFLICT ("id") DO NOTHING;
