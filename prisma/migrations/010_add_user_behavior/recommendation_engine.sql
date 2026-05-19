-- Create UserBehavior table for recommendation engine
CREATE TABLE IF NOT EXISTS "UserBehavior" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "sellerId" TEXT,
    "categoryId" TEXT,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL,
    FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_user_behavior_userId" ON "UserBehavior"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_behavior_timestamp" ON "UserBehavior"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_user_behavior_action" ON "UserBehavior"("action");
CREATE INDEX IF NOT EXISTS "idx_user_behavior_productId" ON "UserBehavior"("productId");

-- Add comment
COMMENT ON TABLE "UserBehavior" IS 'Tracks user interactions for AI recommendation engine';
