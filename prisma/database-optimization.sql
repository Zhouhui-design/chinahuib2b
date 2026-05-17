-- ============================================
-- Database Optimization Script for Chinahuib2b
-- ============================================
-- This script adds missing indexes and optimizes queries
-- Run this after deployment to improve performance

-- 1. Product Performance Indexes
-- ============================================

-- Index for product search by title (full-text search support)
CREATE INDEX IF NOT EXISTS idx_product_title_trgm ON "Product" USING gin (title gin_trgm_ops);

-- Index for featured products (common query pattern)
CREATE INDEX IF NOT EXISTS idx_product_featured_active ON "Product" (isFeatured, isActive, createdAt DESC);

-- Index for category browsing with pagination
CREATE INDEX IF NOT EXISTS idx_product_category_active_created ON "Product" (categoryId, isActive, createdAt DESC);

-- Index for seller's products listing
CREATE INDEX IF NOT EXISTS idx_product_seller_active_created ON "Product" (sellerId, isActive, createdAt DESC);

-- Composite index for view count sorting (popular products)
CREATE INDEX IF NOT EXISTS idx_product_views_active ON "Product" (viewCount DESC, isActive) WHERE isActive = true;

-- 2. Seller Profile Indexes
-- ============================================

-- Index for subscription status queries
CREATE INDEX IF NOT EXISTS idx_seller_subscription_status ON "SellerProfile" (subscriptionStatus, isActive);

-- Index for verified sellers
CREATE INDEX IF NOT EXISTS idx_seller_verified_active ON "SellerProfile" (isVerified, isActive);

-- Index for country/city filtering
CREATE INDEX IF NOT EXISTS idx_seller_country_city ON "SellerProfile" (country, city);

-- 3. Inquiry Optimization
-- ============================================

-- Index for inquiry status tracking
CREATE INDEX IF NOT EXISTS idx_inquiry_status_created ON "Inquiry" (status, createdAt DESC);

-- Index for seller inquiries
CREATE INDEX IF NOT EXISTS idx_inquiry_seller_created ON "Inquiry" (sellerId, createdAt DESC);

-- Index for buyer inquiries
CREATE INDEX IF NOT EXISTS idx_inquiry_buyer_created ON "Inquiry" (buyerId, createdAt DESC);

-- 4. Brochure Download Tracking
-- ============================================

-- Index for download analytics
CREATE INDEX IF NOT EXISTS idx_brochure_download_type_id ON "BrochureDownload" (brochureType, brochureId);

-- Index for user download history
CREATE INDEX IF NOT EXISTS idx_brochure_download_user ON "BrochureDownload" (userId, downloadedAt DESC);

-- 5. Payment Proof Indexes
-- ============================================

-- Index for payment proof status
CREATE INDEX IF NOT EXISTS idx_payment_proof_status ON "PaymentProof" (status, createdAt DESC);

-- Index for seller payment proofs
CREATE INDEX IF NOT EXISTS idx_payment_proof_seller ON "PaymentProof" (sellerId, createdAt DESC);

-- 6. Category Hierarchy Optimization
-- ============================================

-- Index for level-based queries
CREATE INDEX IF NOT EXISTS idx_category_level ON "Category" (level, name);

-- 7. Contact View Tracking
-- ============================================

-- Index for contact view analytics
CREATE INDEX IF NOT EXISTS idx_contact_view_seller ON "ContactView" (sellerId, viewedAt DESC);

-- Index for user contact views
CREATE INDEX IF NOT EXISTS idx_contact_view_user ON "ContactView" (userId, viewedAt DESC);

-- 8. Verification Files
-- ============================================

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_verification_status ON "SellerVerificationFile" (status, createdAt DESC);

-- ============================================
-- Query Optimization Examples
-- ============================================

-- Example 1: Optimized product listing with pagination
-- Before: Sequential scan on entire Product table
-- After: Index scan using idx_product_category_active_created
/*
SELECT * FROM "Product"
WHERE "categoryId" = 'xxx' AND "isActive" = true
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0;
*/

-- Example 2: Featured products query
-- Before: Filter all products, then sort
-- After: Direct index access
/*
SELECT * FROM "Product"
WHERE "isFeatured" = true AND "isActive" = true
ORDER BY "createdAt" DESC
LIMIT 10;
*/

-- Example 3: Popular products by view count
-- Before: Full table scan and sort
-- After: Partial index scan
/*
SELECT * FROM "Product"
WHERE "isActive" = true
ORDER BY "viewCount" DESC
LIMIT 20;
*/

-- Example 4: Seller's active products
-- Before: Filter by sellerId, then check isActive
-- After: Composite index usage
/*
SELECT * FROM "Product"
WHERE "sellerId" = 'xxx' AND "isActive" = true
ORDER BY "createdAt" DESC;
*/

-- ============================================
-- Maintenance Commands
-- ============================================

-- Analyze tables to update statistics (run periodically)
ANALYZE "Product";
ANALYZE "SellerProfile";
ANALYZE "Category";
ANALYZE "Inquiry";
ANALYZE "BrochureDownload";
ANALYZE "PaymentProof";
ANALYZE "ContactView";

-- Vacuum tables to reclaim space (run during low-traffic periods)
VACUUM ANALYZE "Product";
VACUUM ANALYZE "SellerProfile";
VACUUM ANALYZE "Inquiry";

-- Check index usage statistics
/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- Check for missing indexes on frequently queried columns
/*
SELECT
    relname AS table_name,
    attname AS column_name,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
    AND attname IN ('isActive', 'isFeatured', 'status')
ORDER BY relname, attname;
*/

-- Monitor slow queries (requires pg_stat_statements extension)
/*
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries taking more than 100ms on average
ORDER BY mean_time DESC
LIMIT 20;
*/
