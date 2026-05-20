-- Create API Keys table for AI Agents
CREATE TABLE IF NOT EXISTS "APIKey" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL DEFAULT 'AI Agent Key',
    "role" TEXT NOT NULL CHECK ("role" IN ('buyer', 'seller', 'admin')),
    "permissions" JSONB DEFAULT '{}',
    "rateLimit" INTEGER DEFAULT 1000, -- requests per hour
    "isActive" BOOLEAN DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_api_key_userId" ON "APIKey"("userId");
CREATE INDEX IF NOT EXISTS "idx_api_key_key" ON "APIKey"("key");
CREATE INDEX IF NOT EXISTS "idx_api_key_isActive" ON "APIKey"("isActive");

-- Create audit log for API usage
CREATE TABLE IF NOT EXISTS "APIUsageLog" (
    "id" TEXT PRIMARY KEY,
    "apiKeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER, -- milliseconds
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("apiKeyId") REFERENCES "APIKey"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS "idx_api_usage_apiKeyId" ON "APIUsageLog"("apiKeyId");
CREATE INDEX IF NOT EXISTS "idx_api_usage_createdAt" ON "APIUsageLog"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_api_usage_endpoint" ON "APIUsageLog"("endpoint");
