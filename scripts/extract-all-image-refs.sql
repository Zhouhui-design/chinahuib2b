-- 提取所有表中的 /uploads/ 路径引用
-- 输出格式: table_name | column_name | record_id | file_path

-- 1. Booth.logoUrl
SELECT 'Booth' AS tbl, 'logoUrl' AS col, id AS rid, "logoUrl" AS path
FROM "Booth" WHERE "logoUrl" LIKE '/uploads/%'
UNION ALL
-- 2. Booth.bannerUrl
SELECT 'Booth', 'bannerUrl', id, "bannerUrl"
FROM "Booth" WHERE "bannerUrl" LIKE '/uploads/%'
UNION ALL
-- 3. Product.mainImageUrl
SELECT 'Product', 'mainImageUrl', id, "mainImageUrl"
FROM "Product" WHERE "mainImageUrl" LIKE '/uploads/%'
UNION ALL
-- 4. Product.images (array)
SELECT 'Product', 'images', id, img
FROM "Product", unnest(images) AS img
WHERE img LIKE '/uploads/%'
UNION ALL
-- 5. SellerProfile.logoUrl (id 是 userId)
SELECT 'SellerProfile', 'logoUrl', "userId", "logoUrl"
FROM "SellerProfile" WHERE "logoUrl" LIKE '/uploads/%'
UNION ALL
-- 6. SellerProfile.bannerUrl
SELECT 'SellerProfile', 'bannerUrl', "userId", "bannerUrl"
FROM "SellerProfile" WHERE "bannerUrl" LIKE '/uploads/%'
UNION ALL
-- 7. SellerProfile.boothAccentImage
SELECT 'SellerProfile', 'boothAccentImage', "userId", "boothAccentImage"
FROM "SellerProfile" WHERE "boothAccentImage" LIKE '/uploads/%'
UNION ALL
-- 8. SellerProfile.boothBgImage
SELECT 'SellerProfile', 'boothBgImage', "userId", "boothBgImage"
FROM "SellerProfile" WHERE "boothBgImage" LIKE '/uploads/%'
UNION ALL
-- 9. SellerProfile.companyPhotos (array)
SELECT 'SellerProfile', 'companyPhotos', "userId", photo
FROM "SellerProfile", unnest("companyPhotos") AS photo
WHERE photo LIKE '/uploads/%'
UNION ALL
-- 10. SellerProfile.teamPhotos (array)
SELECT 'SellerProfile', 'teamPhotos', "userId", photo
FROM "SellerProfile", unnest("teamPhotos") AS photo
WHERE photo LIKE '/uploads/%'
UNION ALL
-- 11. AuctionListing.images (array)
SELECT 'AuctionListing', 'images', id, img
FROM "AuctionListing", unnest(images) AS img
WHERE img LIKE '/uploads/%'
UNION ALL
-- 12. Blog.featuredImage
SELECT 'Blog', 'featuredImage', id, "featuredImage"
FROM "Blog" WHERE "featuredImage" LIKE '/uploads/%'
UNION ALL
-- 13. Blog.images (array)
SELECT 'Blog', 'images', id, img
FROM "Blog", unnest(images) AS img
WHERE img LIKE '/uploads/%'
UNION ALL
-- 14. PaymentProof.screenshotUrl
SELECT 'PaymentProof', 'screenshotUrl', id, "screenshotUrl"
FROM "PaymentProof" WHERE "screenshotUrl" LIKE '/uploads/%'
UNION ALL
-- 15. ProductBrochure.fileUrl
SELECT 'ProductBrochure', 'fileUrl', id, "fileUrl"
FROM "ProductBrochure" WHERE "fileUrl" LIKE '/uploads/%'
UNION ALL
-- 16. StoreBrochure.fileUrl
SELECT 'StoreBrochure', 'fileUrl', id, "fileUrl"
FROM "StoreBrochure" WHERE "fileUrl" LIKE '/uploads/%'
UNION ALL
-- 17. SellerVerificationFile.fileUrl
SELECT 'SellerVerificationFile', 'fileUrl', id, "fileUrl"
FROM "SellerVerificationFile" WHERE "fileUrl" LIKE '/uploads/%'
UNION ALL
-- 18. DigitalVoucher.images (array)
SELECT 'DigitalVoucher', 'images', id, img
FROM "DigitalVoucher", unnest(images) AS img
WHERE img LIKE '/uploads/%'
UNION ALL
-- 19. Review.images (array)
SELECT 'Review', 'images', id, img
FROM "Review", unnest(images) AS img
WHERE img LIKE '/uploads/%'
UNION ALL
-- 20. Topic.images (array)
SELECT 'Topic', 'images', id, img
FROM "Topic", unnest(images) AS img
WHERE img LIKE '/uploads/%'
UNION ALL
-- 21. User.avatarUrl
SELECT 'User', 'avatarUrl', id, "avatarUrl"
FROM "User" WHERE "avatarUrl" LIKE '/uploads/%'
UNION ALL
-- 22. PublicMessage.fileUrl
SELECT 'PublicMessage', 'fileUrl', id, "fileUrl"
FROM "PublicMessage" WHERE "fileUrl" LIKE '/uploads/%'
-- 注意: documents jsonb 字段单独处理（结构复杂）
ORDER BY tbl, col, rid;
