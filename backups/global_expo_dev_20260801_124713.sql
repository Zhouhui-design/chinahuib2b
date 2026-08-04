--
-- PostgreSQL database dump
--

\restrict PEEd6WnkuWQU5SmQc02PxjzRuOvcPwEe5dyDQGMDmywGJW4BJmEcirjAzn0Qv47

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: expo_dev
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO expo_dev;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: expo_dev
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AIAgentStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."AIAgentStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'REVOKED'
);


ALTER TYPE public."AIAgentStatus" OWNER TO expo_dev;

--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);


ALTER TYPE public."ApplicationStatus" OWNER TO expo_dev;

--
-- Name: AuctionBidStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."AuctionBidStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'OUTBID',
    'CANCELLED',
    'WON',
    'LOST'
);


ALTER TYPE public."AuctionBidStatus" OWNER TO expo_dev;

--
-- Name: AuctionListingType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."AuctionListingType" AS ENUM (
    'SELLING',
    'BUYING'
);


ALTER TYPE public."AuctionListingType" OWNER TO expo_dev;

--
-- Name: AuctionStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."AuctionStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CLOSED',
    'COMPLETED',
    'PENDING'
);


ALTER TYPE public."AuctionStatus" OWNER TO expo_dev;

--
-- Name: BlogCategory; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."BlogCategory" AS ENUM (
    'INDUSTRY_NEWS',
    'MARKET_TRENDS',
    'PRODUCT_GUIDES',
    'COMPANY_UPDATES',
    'SUCCESS_STORIES',
    'TIPS_ADVICE',
    'OTHER'
);


ALTER TYPE public."BlogCategory" OWNER TO expo_dev;

--
-- Name: BoothCustomizationType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."BoothCustomizationType" AS ENUM (
    'THEME',
    'COLOR_SCHEME',
    'LAYOUT',
    'BANNER',
    'DECOR',
    'ANIMATION',
    'FONT',
    'BACKGROUND'
);


ALTER TYPE public."BoothCustomizationType" OWNER TO expo_dev;

--
-- Name: BrochureType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."BrochureType" AS ENUM (
    'PRODUCT',
    'STORE'
);


ALTER TYPE public."BrochureType" OWNER TO expo_dev;

--
-- Name: CompanyType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."CompanyType" AS ENUM (
    'MANUFACTURER',
    'TRADER',
    'BOTH'
);


ALTER TYPE public."CompanyType" OWNER TO expo_dev;

--
-- Name: DeliverableStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."DeliverableStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."DeliverableStatus" OWNER TO expo_dev;

--
-- Name: EscrowStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."EscrowStatus" AS ENUM (
    'PENDING',
    'FUNDED',
    'RELEASING',
    'COMPLETED',
    'DISPUTED',
    'REFUNDED'
);


ALTER TYPE public."EscrowStatus" OWNER TO expo_dev;

--
-- Name: FeeType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."FeeType" AS ENUM (
    'SHOUT_OUT',
    'BOOTH_SUBSCRIPTION',
    'AUCTION_COMMISSION',
    'SYSTEM_NOTICE',
    'WITHDRAWAL'
);


ALTER TYPE public."FeeType" OWNER TO expo_dev;

--
-- Name: GoodsVerificationStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."GoodsVerificationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."GoodsVerificationStatus" OWNER TO expo_dev;

--
-- Name: InquiryStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."InquiryStatus" AS ENUM (
    'PENDING',
    'REPLIED',
    'CLOSED'
);


ALTER TYPE public."InquiryStatus" OWNER TO expo_dev;

--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'IMAGE',
    'FILE'
);


ALTER TYPE public."MessageType" OWNER TO expo_dev;

--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'PAID'
);


ALTER TYPE public."MilestoneStatus" OWNER TO expo_dev;

--
-- Name: OrganizationType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."OrganizationType" AS ENUM (
    'ENTERPRISE',
    'INDIVIDUAL',
    'STATE_OWNED',
    'PERSONAL'
);


ALTER TYPE public."OrganizationType" OWNER TO expo_dev;

--
-- Name: OwnerType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."OwnerType" AS ENUM (
    'USER',
    'SELLER',
    'SYSTEM'
);


ALTER TYPE public."OwnerType" OWNER TO expo_dev;

--
-- Name: PageType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."PageType" AS ENUM (
    'STATIC',
    'PRODUCT',
    'STORE',
    'CATEGORY',
    'CUSTOM'
);


ALTER TYPE public."PageType" OWNER TO expo_dev;

--
-- Name: PaymentGateway; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."PaymentGateway" AS ENUM (
    'ALIPAY',
    'WECHAT',
    'WORLDFIRST',
    'MANUAL'
);


ALTER TYPE public."PaymentGateway" OWNER TO expo_dev;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."PaymentStatus" OWNER TO expo_dev;

--
-- Name: ProfileStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."ProfileStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ProfileStatus" OWNER TO expo_dev;

--
-- Name: ReviewRating; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."ReviewRating" AS ENUM (
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE'
);


ALTER TYPE public."ReviewRating" OWNER TO expo_dev;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'FREE_TRIAL',
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO expo_dev;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TaskStatus" OWNER TO expo_dev;

--
-- Name: TaskType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."TaskType" AS ENUM (
    'MANUFACTURING',
    'PRODUCT_SALE',
    'SERVICE'
);


ALTER TYPE public."TaskType" OWNER TO expo_dev;

--
-- Name: TopicCategory; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."TopicCategory" AS ENUM (
    'INDUSTRY',
    'HOT_TOPIC',
    'PRODUCT',
    'NEWS',
    'RECRUITMENT',
    'ARTICLE',
    'OTHER'
);


ALTER TYPE public."TopicCategory" OWNER TO expo_dev;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."TransactionStatus" OWNER TO expo_dev;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'PAYMENT',
    'REFUND',
    'FEE'
);


ALTER TYPE public."TransactionType" OWNER TO expo_dev;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."UserRole" AS ENUM (
    'BUYER',
    'SELLER',
    'ADMIN',
    'AI_BUYER',
    'AI_SELLER',
    'AI_ASSISTANT'
);


ALTER TYPE public."UserRole" OWNER TO expo_dev;

--
-- Name: VerificationFileType; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."VerificationFileType" AS ENUM (
    'BUSINESS_LICENSE',
    'ID_CARD',
    'DRIVER_LICENSE',
    'CREDIT_CARD',
    'PHOTO',
    'VIDEO',
    'OTHER',
    'OPERATING_LICENSE',
    'TAX_REGISTRATION',
    'ORG_CODE_CERTIFICATE',
    'ISO_CERTIFICATION',
    'CE_CERTIFICATION',
    'FDA_CERTIFICATION',
    'EXPORT_LICENSE',
    'IMPORT_LICENSE',
    'COUNTRY_REGISTRATION'
);


ALTER TYPE public."VerificationFileType" OWNER TO expo_dev;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'NOT_APPLIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO expo_dev;

--
-- Name: VoucherStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."VoucherStatus" AS ENUM (
    'CREATED',
    'PENDING_VERIFICATION',
    'VERIFIED',
    'LISTED',
    'TRANSFERRED',
    'REDEEMED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."VoucherStatus" OWNER TO expo_dev;

--
-- Name: VoucherTransactionStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."VoucherTransactionStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."VoucherTransactionStatus" OWNER TO expo_dev;

--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: expo_dev
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."WithdrawalStatus" OWNER TO expo_dev;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AIAgent; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."AIAgent" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    capabilities text[],
    status public."AIAgentStatus" DEFAULT 'PENDING'::public."AIAgentStatus" NOT NULL,
    "ownerId" text NOT NULL,
    "ownerType" public."OwnerType" NOT NULL,
    "apiKey" text NOT NULL,
    "secretKey" text NOT NULL,
    "webhookUrl" text,
    permissions jsonb NOT NULL,
    "lastActiveAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AIAgent" OWNER TO expo_dev;

--
-- Name: AIAgentAuditLog; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."AIAgentAuditLog" (
    id text NOT NULL,
    "agentId" text NOT NULL,
    action text NOT NULL,
    status text NOT NULL,
    reason text,
    details text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AIAgentAuditLog" OWNER TO expo_dev;

--
-- Name: AIAuditLog; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."AIAuditLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    target text,
    result text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AIAuditLog" OWNER TO expo_dev;

--
-- Name: AIPermission; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."AIPermission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    permission text NOT NULL,
    "isAllowed" boolean DEFAULT true NOT NULL,
    scope jsonb,
    "grantedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."AIPermission" OWNER TO expo_dev;

--
-- Name: APIKey; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."APIKey" (
    id text NOT NULL,
    "userId" text NOT NULL,
    key text NOT NULL,
    name text DEFAULT 'AI Agent Key'::text NOT NULL,
    role text NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    "rateLimit" integer DEFAULT 1000 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."APIKey" OWNER TO expo_dev;

--
-- Name: APIUsageLog; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."APIUsageLog" (
    id text NOT NULL,
    "apiKeyId" text NOT NULL,
    "userId" text NOT NULL,
    endpoint text NOT NULL,
    method text NOT NULL,
    "statusCode" integer,
    "responseTime" integer,
    "ipAddress" text,
    "userAgent" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."APIUsageLog" OWNER TO expo_dev;

--
-- Name: AuctionBid; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."AuctionBid" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "bidderId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "isAutoBid" boolean DEFAULT false NOT NULL,
    "maxAutoBid" numeric(10,2),
    status public."AuctionBidStatus" DEFAULT 'PENDING'::public."AuctionBidStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuctionBid" OWNER TO expo_dev;

--
-- Name: AuctionListing; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."AuctionListing" (
    id text NOT NULL,
    type public."AuctionListingType" NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    tags text[],
    price numeric(10,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    "minOrderQty" integer DEFAULT 1,
    "maxOrderQty" integer,
    images text[],
    videos text[],
    documents text[],
    "contactEmail" text,
    "contactPhone" text,
    "contactWeChat" text,
    "contactWhatsApp" text,
    "posterId" text NOT NULL,
    "sellerId" text,
    "isPaid" boolean DEFAULT true NOT NULL,
    cost numeric(10,2),
    "paymentId" text,
    status public."AuctionStatus" DEFAULT 'ACTIVE'::public."AuctionStatus" NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    inquiries integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "digitalVoucherId" text,
    "techSpecs" text,
    "productFeatures" text,
    "applicationScope" text,
    "usageMethod" text,
    "shippingCountry" text,
    "detailedAddress" text,
    "isFob" text,
    "isCif" text,
    "verificationStatus" public."VerificationStatus" DEFAULT 'NOT_APPLIED'::public."VerificationStatus" NOT NULL,
    "verificationFee" numeric(10,2),
    "verificationNotes" text,
    "unitId" text,
    "exportDocuments" jsonb,
    "exportLicenseNo" text,
    "freightItems" jsonb,
    "hasExportLicense" boolean DEFAULT false NOT NULL,
    "hsCode" text,
    "hsCodeDescription" text,
    incoterms text,
    "paymentMethods" jsonb,
    "portOfDestination" text,
    "portOfLoading" text
);


ALTER TABLE public."AuctionListing" OWNER TO expo_dev;

--
-- Name: Blog; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Blog" (
    id text NOT NULL,
    title text NOT NULL,
    "titleEn" text,
    slug text NOT NULL,
    content text NOT NULL,
    "contentEn" text,
    excerpt text,
    "excerptEn" text,
    category public."BlogCategory" DEFAULT 'OTHER'::public."BlogCategory" NOT NULL,
    tags text[],
    images text[],
    "featuredImage" text,
    "authorId" text NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "commentCount" integer DEFAULT 0 NOT NULL,
    "seoTitle" text,
    "seoTitleEn" text,
    "seoDescription" text,
    "seoDescriptionEn" text,
    "seoKeywords" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Blog" OWNER TO expo_dev;

--
-- Name: BlogComment; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."BlogComment" (
    id text NOT NULL,
    "blogId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "parentId" text,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BlogComment" OWNER TO expo_dev;

--
-- Name: BlogLike; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."BlogLike" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "blogId" text,
    "commentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BlogLike" OWNER TO expo_dev;

--
-- Name: Booth; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Booth" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "boothNumber" text NOT NULL,
    name text NOT NULL,
    names jsonb,
    "exhibitionName" text NOT NULL,
    "exhibitionDates" jsonb,
    location text,
    "logoUrl" text,
    "bannerUrl" text,
    keywords jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    theme text,
    "colorScheme" text,
    layout text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    documents jsonb
);


ALTER TABLE public."Booth" OWNER TO expo_dev;

--
-- Name: BoothCustomization; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."BoothCustomization" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    type public."BoothCustomizationType" NOT NULL,
    value text,
    config jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BoothCustomization" OWNER TO expo_dev;

--
-- Name: BoothView; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."BoothView" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "viewerId" text,
    duration integer,
    interactions jsonb,
    referrer text,
    "deviceType" text,
    country text,
    city text,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BoothView" OWNER TO expo_dev;

--
-- Name: BrochureDownload; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."BrochureDownload" (
    id text NOT NULL,
    "userId" text,
    "brochureType" public."BrochureType" NOT NULL,
    "brochureId" text NOT NULL,
    "downloadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text
);


ALTER TABLE public."BrochureDownload" OWNER TO expo_dev;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text,
    slug text NOT NULL,
    level integer NOT NULL,
    "parentId" text,
    model text,
    "modelEn" text,
    series text,
    "seriesEn" text,
    description text,
    "descriptionEn" text,
    "hsCode" text
);


ALTER TABLE public."Category" OWNER TO expo_dev;

--
-- Name: ContactView; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."ContactView" (
    id text NOT NULL,
    "viewerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ContactView" OWNER TO expo_dev;

--
-- Name: DeadLink; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."DeadLink" (
    id text NOT NULL,
    url text NOT NULL,
    "sourceUrl" text,
    "statusCode" integer NOT NULL,
    "isResolved" boolean DEFAULT false NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "detectedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastCheckedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DeadLink" OWNER TO expo_dev;

--
-- Name: DigitalVoucher; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."DigitalVoucher" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    title text NOT NULL,
    description text,
    value numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "redemptionCode" text NOT NULL,
    "isRedeemed" boolean DEFAULT false NOT NULL,
    "redeemedById" text,
    "redeemedAt" timestamp(3) without time zone,
    "validFrom" timestamp(3) without time zone NOT NULL,
    "validUntil" timestamp(3) without time zone,
    "isVerified" boolean DEFAULT false NOT NULL,
    "securityHash" text,
    images text[],
    terms text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "certificateNumber" text,
    documents jsonb,
    "goodsCategory" text,
    "goodsDescription" text,
    "goodsDimensions" text,
    "goodsName" text,
    "goodsOrigin" text,
    "goodsQuantity" integer,
    "goodsSpecifications" jsonb,
    "goodsWeight" double precision,
    "hashAlgorithm" text,
    "hashGeneratedAt" timestamp(3) without time zone,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "logisticsStatus" text,
    status public."VoucherStatus" DEFAULT 'CREATED'::public."VoucherStatus" NOT NULL,
    "trackingNumber" text,
    "verificationStatus" public."GoodsVerificationStatus" DEFAULT 'PENDING'::public."GoodsVerificationStatus" NOT NULL
);


ALTER TABLE public."DigitalVoucher" OWNER TO expo_dev;

--
-- Name: DigitalVoucherTransaction; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."DigitalVoucherTransaction" (
    id text NOT NULL,
    "voucherId" text NOT NULL,
    "buyerId" text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "transactionId" text,
    "verifiedBy" text,
    "verifiedAt" timestamp(3) without time zone,
    "deliveryInfo" jsonb,
    status public."VoucherTransactionStatus" DEFAULT 'PENDING'::public."VoucherTransactionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "transactionType" text
);


ALTER TABLE public."DigitalVoucherTransaction" OWNER TO expo_dev;

--
-- Name: GoodsVerificationRecord; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."GoodsVerificationRecord" (
    id text NOT NULL,
    "voucherId" text NOT NULL,
    "verifiedBy" text,
    status public."GoodsVerificationStatus" DEFAULT 'PENDING'::public."GoodsVerificationStatus" NOT NULL,
    notes text,
    images jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."GoodsVerificationRecord" OWNER TO expo_dev;

--
-- Name: Inquiry; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Inquiry" (
    id text NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "productId" text,
    message text NOT NULL,
    "contactInfo" text NOT NULL,
    status public."InquiryStatus" DEFAULT 'PENDING'::public."InquiryStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Inquiry" OWNER TO expo_dev;

--
-- Name: LogisticsUpdate; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."LogisticsUpdate" (
    id text NOT NULL,
    "voucherId" text NOT NULL,
    status text NOT NULL,
    location text,
    description text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LogisticsUpdate" OWNER TO expo_dev;

--
-- Name: MarketplaceTask; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."MarketplaceTask" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type public."TaskType" NOT NULL,
    budget numeric(10,2),
    price numeric(10,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    unit text,
    "minOrderQty" integer,
    deadline timestamp(3) without time zone,
    status public."TaskStatus" DEFAULT 'OPEN'::public."TaskStatus" NOT NULL,
    "postedById" text NOT NULL,
    "contactInfo" text,
    applications integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    rating numeric(3,2),
    attachments jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketplaceTask" OWNER TO expo_dev;

--
-- Name: Notice; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Notice" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "senderId" text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    "isGlobal" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notice" OWNER TO expo_dev;

--
-- Name: PaymentProof; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."PaymentProof" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sellerProfileId" text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "transactionId" text,
    "paymentMethod" text DEFAULT 'ALIPAY'::text NOT NULL,
    "screenshotUrl" text,
    notes text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "adminNotes" text,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone
);


ALTER TABLE public."PaymentProof" OWNER TO expo_dev;

--
-- Name: PlatformFee; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."PlatformFee" (
    id text NOT NULL,
    "feeType" public."FeeType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PlatformFee" OWNER TO expo_dev;

--
-- Name: PrivateMessage; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."PrivateMessage" (
    id text NOT NULL,
    content text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PrivateMessage" OWNER TO expo_dev;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "categoryId" text NOT NULL,
    title text NOT NULL,
    "titleEn" text,
    description text,
    specifications jsonb,
    "minOrderQty" integer,
    "supplyCapacity" text,
    "mainImageUrl" text NOT NULL,
    images text[],
    videos text[],
    documents jsonb,
    "hasBrochure" boolean DEFAULT false NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "inquiryCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "boothId" text,
    descriptions jsonb,
    titles jsonb,
    "minOrderUnitId" text,
    "supplyCapacityUnitId" text
);


ALTER TABLE public."Product" OWNER TO expo_dev;

--
-- Name: ProductBrochure; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."ProductBrochure" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "downloadCount" integer DEFAULT 0 NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProductBrochure" OWNER TO expo_dev;

--
-- Name: PublicMessage; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."PublicMessage" (
    id text NOT NULL,
    content text NOT NULL,
    "senderId" text NOT NULL,
    "linkedSellerId" text,
    "isSystemMessage" boolean DEFAULT false NOT NULL,
    "isAnnouncement" boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    reactions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fileName" text,
    "fileSize" integer,
    "fileUrl" text,
    "isWorldChat" boolean DEFAULT false NOT NULL,
    "messageType" public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    "mimeType" text
);


ALTER TABLE public."PublicMessage" OWNER TO expo_dev;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text,
    "sellerId" text,
    "userId" text NOT NULL,
    rating public."ReviewRating" NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    images text[],
    "isVerified" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "replyContent" text,
    "repliedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO expo_dev;

--
-- Name: ReviewHelpfulVote; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."ReviewHelpfulVote" (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReviewHelpfulVote" OWNER TO expo_dev;

--
-- Name: SEOConfig; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."SEOConfig" (
    id text NOT NULL,
    "pagePath" text NOT NULL,
    title text,
    "titleEn" text,
    description text,
    "descriptionEn" text,
    keywords text,
    "keywordsEn" text,
    "pageType" public."PageType" DEFAULT 'STATIC'::public."PageType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SEOConfig" OWNER TO expo_dev;

--
-- Name: SellerProfile; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."SellerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyName" text NOT NULL,
    "companyType" public."CompanyType" NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    address text,
    phone text,
    email text,
    website text,
    description text,
    "logoUrl" text,
    "bannerUrl" text,
    certifications text[],
    "subscriptionStatus" public."SubscriptionStatus" DEFAULT 'FREE_TRIAL'::public."SubscriptionStatus" NOT NULL,
    "subscriptionExpiry" timestamp(3) without time zone,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "boothCategories" text[],
    "boothName" text,
    "isCustomizable" boolean DEFAULT false NOT NULL,
    "lastPaymentAt" timestamp(3) without time zone,
    "subscriptionAmount" numeric(10,2),
    facebook text,
    instagram text,
    linkedin text,
    telegram text,
    wechat text,
    whatsapp text,
    "booth3DPreview" boolean DEFAULT false NOT NULL,
    "boothAccentImage" text,
    "boothAnimations" boolean DEFAULT false NOT NULL,
    "boothBgImage" text,
    "boothColor" text,
    "boothFont" text,
    "boothLayout" text,
    "boothTags" text[],
    "boothTheme" text,
    descriptions jsonb,
    awards text[],
    "bankAccount" text,
    bilibili text,
    "boothNames" jsonb,
    "businessAddress" text,
    "businessScope" text,
    "chatSystem" text,
    "companyPhotos" text[],
    dingtalk text,
    douyin text,
    "employeeCount" text,
    "foundingYear" text,
    kuaishou text,
    lark text,
    "legalRepresentative" text,
    "mapAddress" text,
    "mapLatitude" double precision,
    "mapLongitude" double precision,
    "organizationType" public."OrganizationType" DEFAULT 'ENTERPRISE'::public."OrganizationType" NOT NULL,
    patents text[],
    pinterest text,
    "profileReviewNotes" text,
    "profileReviewedAt" timestamp(3) without time zone,
    "profileReviewedBy" text,
    "profileStatus" public."ProfileStatus" DEFAULT 'DRAFT'::public."ProfileStatus" NOT NULL,
    "profileSubmittedAt" timestamp(3) without time zone,
    qq text,
    reddit text,
    "registeredAddress" text,
    "registeredCapital" text,
    "registrationNumber" text,
    snapchat text,
    "taxNumber" text,
    "teamPhotos" text[],
    tiktok text,
    tumblr text,
    twitter text,
    "wechatVideo" text,
    weibo text,
    xiaohongshu text,
    youtube text,
    "contactName" text
);


ALTER TABLE public."SellerProfile" OWNER TO expo_dev;

--
-- Name: SellerVerificationFile; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."SellerVerificationFile" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "fileType" public."VerificationFileType" NOT NULL,
    "fileUrl" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "certificateName" text,
    "certificateNumber" text,
    "expiryDate" text,
    "issueDate" text,
    "issuingAuthority" text
);


ALTER TABLE public."SellerVerificationFile" OWNER TO expo_dev;

--
-- Name: ShoutOut; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."ShoutOut" (
    id text NOT NULL,
    content text NOT NULL,
    "senderId" text NOT NULL,
    "isFree" boolean DEFAULT true NOT NULL,
    cost numeric(10,2),
    "paymentId" text,
    priority integer DEFAULT 1 NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "clickCount" integer DEFAULT 0 NOT NULL,
    reactions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    location text,
    tags text[],
    type text DEFAULT 'general'::text NOT NULL
);


ALTER TABLE public."ShoutOut" OWNER TO expo_dev;

--
-- Name: StoreBrochure; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."StoreBrochure" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    title text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "downloadCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StoreBrochure" OWNER TO expo_dev;

--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."SystemSetting" (
    id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemSetting" OWNER TO expo_dev;

--
-- Name: TaskApplication; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."TaskApplication" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "applicantId" text NOT NULL,
    message text NOT NULL,
    quote numeric(10,2),
    "deliveryTime" text,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TaskApplication" OWNER TO expo_dev;

--
-- Name: TaskDeliverable; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."TaskDeliverable" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    title text NOT NULL,
    description text,
    files jsonb,
    "submittedAt" timestamp(3) without time zone,
    status public."DeliverableStatus" DEFAULT 'DRAFT'::public."DeliverableStatus" NOT NULL,
    "reviewNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TaskDeliverable" OWNER TO expo_dev;

--
-- Name: TaskEscrow; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."TaskEscrow" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "holdAmount" numeric(10,2) NOT NULL,
    "releaseAmount" numeric(10,2) NOT NULL,
    status public."EscrowStatus" DEFAULT 'PENDING'::public."EscrowStatus" NOT NULL,
    "transactionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TaskEscrow" OWNER TO expo_dev;

--
-- Name: TaskMilestone; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."TaskMilestone" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    title text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    "order" integer NOT NULL,
    status public."MilestoneStatus" DEFAULT 'PENDING'::public."MilestoneStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TaskMilestone" OWNER TO expo_dev;

--
-- Name: Topic; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Topic" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category public."TopicCategory" DEFAULT 'OTHER'::public."TopicCategory" NOT NULL,
    images text[],
    videos text[],
    documents jsonb,
    link text,
    phone text,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "commentCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Topic" OWNER TO expo_dev;

--
-- Name: TopicComment; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."TopicComment" (
    id text NOT NULL,
    "topicId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "parentId" text,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TopicComment" OWNER TO expo_dev;

--
-- Name: TopicLike; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."TopicLike" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "topicId" text,
    "commentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TopicLike" OWNER TO expo_dev;

--
-- Name: Unit; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Unit" (
    id text NOT NULL,
    name text NOT NULL,
    "nameEn" text NOT NULL,
    symbol text,
    description text,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Unit" OWNER TO expo_dev;

--
-- Name: User; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'BUYER'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "avatarUrl" text,
    bio text,
    company text,
    "displayName" text,
    location text,
    phone text,
    website text,
    "aiCapabilities" jsonb,
    "aiModel" text,
    "aiProvider" text,
    "dailyShoutOuts" integer DEFAULT 10 NOT NULL,
    "isOnline" boolean DEFAULT false NOT NULL,
    "isSystemAI" boolean DEFAULT false NOT NULL,
    "lastSeenAt" timestamp(3) without time zone,
    "lastShoutOutDate" timestamp(3) without time zone,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    balance numeric(10,2),
    "chatSystemLinkedAt" timestamp(3) without time zone,
    "chatSystemToken" text,
    "chatSystemUserId" text,
    "isAI" boolean DEFAULT false NOT NULL,
    "ownerId" text,
    "receiveNotices" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."User" OWNER TO expo_dev;

--
-- Name: VerificationCountry; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."VerificationCountry" (
    id text NOT NULL,
    name text NOT NULL,
    "nameZh" text,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationCountry" OWNER TO expo_dev;

--
-- Name: VerificationRequest; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."VerificationRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "listingId" text,
    "shippingCountry" text NOT NULL,
    "detailedAddress" text NOT NULL,
    status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "feeAmount" numeric(10,2),
    "feeCurrency" text DEFAULT 'USD'::text NOT NULL,
    notes text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationRequest" OWNER TO expo_dev;

--
-- Name: Visitor; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Visitor" (
    id text NOT NULL,
    "ipHash" text NOT NULL,
    "productId" text,
    "sellerId" text,
    "viewerId" text,
    country text,
    "countryCode" text,
    city text,
    region text,
    timezone text,
    isp text,
    "userAgent" text,
    url text,
    "isSelfView" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Visitor" OWNER TO expo_dev;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance numeric(10,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    "totalDeposited" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalWithdrawn" numeric(10,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Wallet" OWNER TO expo_dev;

--
-- Name: WalletTransaction; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."WalletTransaction" (
    id text NOT NULL,
    "walletId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    reference text,
    description text,
    gateway public."PaymentGateway",
    "gatewayTxId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WalletTransaction" OWNER TO expo_dev;

--
-- Name: WithdrawalRequest; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."WithdrawalRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    gateway public."PaymentGateway" NOT NULL,
    "gatewayDetails" jsonb,
    status public."WithdrawalStatus" DEFAULT 'PENDING'::public."WithdrawalStatus" NOT NULL,
    "reviewedByAdmin" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNotes" text,
    "gatewayTxId" text,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WithdrawalRequest" OWNER TO expo_dev;

--
-- Name: WorldChatMessage; Type: TABLE; Schema: public; Owner: expo_dev
--

CREATE TABLE public."WorldChatMessage" (
    id text NOT NULL,
    content text NOT NULL,
    "senderId" text NOT NULL,
    "isFree" boolean DEFAULT true NOT NULL,
    cost numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WorldChatMessage" OWNER TO expo_dev;

--
-- Data for Name: AIAgent; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."AIAgent" (id, name, description, capabilities, status, "ownerId", "ownerType", "apiKey", "secretKey", "webhookUrl", permissions, "lastActiveAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AIAgentAuditLog; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."AIAgentAuditLog" (id, "agentId", action, status, reason, details, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: AIAuditLog; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."AIAuditLog" (id, "userId", action, target, result, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: AIPermission; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."AIPermission" (id, "userId", permission, "isAllowed", scope, "grantedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: APIKey; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."APIKey" (id, "userId", key, name, role, permissions, "rateLimit", "isActive", "lastUsedAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: APIUsageLog; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."APIUsageLog" (id, "apiKeyId", "userId", endpoint, method, "statusCode", "responseTime", "ipAddress", "userAgent", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: AuctionBid; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."AuctionBid" (id, "listingId", "bidderId", amount, currency, "isAutoBid", "maxAutoBid", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: AuctionListing; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."AuctionListing" (id, type, title, description, category, tags, price, currency, "minOrderQty", "maxOrderQty", images, videos, documents, "contactEmail", "contactPhone", "contactWeChat", "contactWhatsApp", "posterId", "sellerId", "isPaid", cost, "paymentId", status, views, inquiries, "isVerified", "expiresAt", "createdAt", "updatedAt", "digitalVoucherId", "techSpecs", "productFeatures", "applicationScope", "usageMethod", "shippingCountry", "detailedAddress", "isFob", "isCif", "verificationStatus", "verificationFee", "verificationNotes", "unitId", "exportDocuments", "exportLicenseNo", "freightItems", "hasExportLicense", "hsCode", "hsCodeDescription", incoterms, "paymentMethods", "portOfDestination", "portOfLoading") FROM stdin;
cmrxf3ctj0000t4g8w48fwvu6	SELLING	A00 Aluminum Ingot，A00铝锭，A00アルミニウム地金，A00 알루미늄 잉곳 판매，		cmrunjn3z0004u5g8lswspswy	{}	3589.00	USD	1	\N	{}	{}	{}	\N	\N	\N	\N	cmprziifr000763g8vjb4v75f	\N	t	\N	\N	ACTIVE	2	0	t	\N	2026-07-23 11:17:47.815	2026-07-25 07:44:07.871	\N	铝含量（AL）≥99.7%（质量百分比）\n单块重量：20kg~25kg/块\n捆扎重量：约1000kg/捆\n硅（Si）≤0.05%\n铁（Fe）≤0.15%\n铜（Cu）≤0.0002%\n镓（Ga）≤0.02%\n镁（Mg）≤0.002%\n锌（Zn）≤0.02%\n钒（V）≤0.018%	\N	\N	\N	China	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	NEGOTIATE	NEGOTIATE	VERIFIED	\N	审核通过	cmrvq53hy000j3yg89qpcwczu	\N	\N	\N	f	\N	\N	\N	\N	\N	\N
cms02ac6v000so0g84q61gb1w	SELLING	Metanol công nghiệp，ndustrial methanol，Metanol industrial，الميثانول الصناعي，Metanol industrial，Metanol industri	We supply Type I industrial methanol complying with GB/T 338-2025 national standard. The product reaches 99.99% high purity with stable quality as shown in our full inspection report. This colorless transparent liquid serves as a universal organic solvent and basic chemical raw material, widely used in chemical synthesis, industrial cleaning, coating dilution, boiler fuel and new energy production. Bulk stock and flexible supply methods are available for global industrial buyers.\n\n## Full Detailed Version (For Alibaba / Independent Website Product Page)\n\n### Product Introduction\n\nOur industrial methanol strictly follows GB/T 338-2025 standard and passes complete laboratory testing. The tested purity hits 99.99%, categorized as Type I premium grade. No visible impurities, low moisture, low acidity and excellent stability are its core advantages. Each batch comes with official quality inspection certificate to guarantee consistent performance.\n\n### Key Specifications\n\n- Appearance: Colorless transparent liquid without visible impurities\n- Purity (w%): 99.99%\n- Standard: GB/T 338-2025 Type I\n- Low moisture content: ≤0.01%\n- Long potassium permanganate test time: 86 min\n- Low impurity content including acetone, ethanol and acid substances\n\n### Wide Application Scenarios\n\n1. Organic chemical synthesis intermediate for pharmaceutical, resin and plastic manufacturing\n2. Industrial cleaning solvent for machinery, metal parts and electronic equipment\n3. Diluent for paint, ink, coating and adhesive production\n4. Clean fuel for industrial boilers, heating systems and new energy projects\n5. Raw material for formaldehyde, methyl ester and other derivative chemicals\n\n### Supply Advantages\n\nWe maintain sufficient bulk inventory all year round. Multiple delivery solutions including tank truck and IBC tote can be arranged to match different order volumes. Our professional technical team can offer parameter support according to local industrial standards for global partners. All prod	cmrzz2ru7000qo0g8rkloh24w	{}	582.00	USD	1	\N	{}	{}	{}	aardenx@outlook.com	+8618627407019	\N	\N	cmprziifr000763g8vjb4v75f	\N	t	\N	\N	ACTIVE	7	0	t	\N	2026-07-25 07:42:37.111	2026-07-26 03:21:33.404	\N	**Industrial Methanol Parameters**\nStandard: GB/T 338-2025 Type I\nAppearance: Colorless transparent liquid without visible impurities\nPurity: 99.99%\nColor (Pt-Co): 0 Hazen unit\nDensity (20℃): 0.7912 g/cm³\nPotassium permanganate test: 86 min\nWater content: 0.01%\nAcidity (as formic acid): 0.0005%\nEthanol content: 0.0018%\nAcetone: Not detected	\N	\N	\N	China	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	NEGOTIATE	NEGOTIATE	VERIFIED	\N	审核通过	cmrvq53hy000j3yg89qpcwczu	\N	\N	\N	f	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Blog; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Blog" (id, title, "titleEn", slug, content, "contentEn", excerpt, "excerptEn", category, tags, images, "featuredImage", "authorId", "isPublished", "viewCount", "likeCount", "commentCount", "seoTitle", "seoTitleEn", "seoDescription", "seoDescriptionEn", "seoKeywords", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BlogComment; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."BlogComment" (id, "blogId", "userId", content, "parentId", "likeCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BlogLike; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."BlogLike" (id, "userId", "blogId", "commentId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Booth; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Booth" (id, "sellerId", "boothNumber", name, names, "exhibitionName", "exhibitionDates", location, "logoUrl", "bannerUrl", keywords, "isActive", "isPublished", theme, "colorScheme", layout, "createdAt", "updatedAt", documents) FROM stdin;
cmrvjgce300003yg8rxsyljbs	cmruibk9q00024ig83uq02u99	BTH-000001	China International Non‑Ferrous Metals All‑Varieties Trading Expo	\N	Taizhou Huihuan International Trading Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/21fab859-6d33-445e-af37-b7aa7b8676d3.webp	/uploads/others/31a3faf3-5dbe-42de-83db-fe92ff2b8db2.webp	["aluminum ingot", "铝锭", "アルミニウム地金", "알루미늄 잉곳", "Aluminiumbarren", "lingote de aluminio", "lingot d'aluminium", "алюминиевый чушок", "سبيكة ألومنيوم", "lingote de alumínio"]	t	t	Light		Modern	2026-07-22 03:44:19.9	2026-07-22 03:46:23.754	\N
cms4nc65v0000wfg8gn40qd7s	cmruibk9q00024ig83uq02u99	BTH-000006	Jianhao Fire Safety & Protection Expo	\N	Taizhou Huihuan International Trading Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/4eefe127-9225-4901-b280-e7da5486c368.webp	/uploads/others/074ad0f6-04ef-473a-b882-98b6902730bf.webp	["Fire Safety & Protection Expo", "消防安全与防护展览会", "अग्नि सुरक्षा और संरक्षण प्रदर्शनी (Agni Suraksha aur Sanrakshan Pradarshani)", "Exposición de Seguridad y Protección Contra Incendios", "معرض السلامة والحماية من الحرائق", "Ma‘rad al-Salāmah wa al-Himāyah min al-Harā’iq", "Salon de la Sécurité et de la Protection Incendie", "Exposição de Segurança e Proteção contra Incêndios", "Выставка пожарной безопасности и защиты", "Vystavka pozharnoy bezopasnosti i zashchity", "অগ্নি নিরাপত্তা ও সুরক্ষা প্রদর্শনী", "Agni Nirapotta o Suraksha Pradarshani"]	t	t	Dark		Grid	2026-07-28 12:42:59.251	2026-07-30 07:53:40.084	[{"url": "/uploads/booth-documents/326e7a6c-4baa-4611-a702-6cd0954decfc.pdf", "name": "24建豪消防资质画册_redacted.pdf", "size": 31555167, "type": "application/pdf"}]
cms05grmv000to0g8iyzkw58e	cmruibk9q00024ig83uq02u99	BTH-000004	PAVO CNC Machining Tool & Boring System Exhibition	\N	Harbin Bearing Manufacturing Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/d7a9705d-e4dd-47ff-a54f-4248c905c72e.webp	/uploads/others/fefdd348-864a-41fc-9825-1293b3a25db2.webp	["PAVO Cutting Tools", "Herramientas de corte PAVO", "Outils de coupe PAVO", "أدوات قطع بافو، أدوات سي إن سي، أداة توسيع الثقوب، مخرطة، مثاقب، لوحات كربيد، حامل أدوات المعالجة، معالجة دقيقة، قطع معالجة سي إن سي، أدوات معالجة المعادن", "Ferramentas de corte PAVO", "Dao cắt PAVO, Dao CNC", "Alat potong PAVO", "เครื่องมือตัด PAVO, เครื่องมือ CNC,", "PAVO Schneidwerkzeuge", "PAVO kesme takımları", "Metal işleme takımları", "Metallverarbeitungswerkzeuge", "เครื่องมือแปรรูปโลหะ", "Alat pengolahan logam", "Dao xử lý kim loại", "Ferramentas de processamento de metal", "Outils de transformation métallique", "Herramientas de procesamiento de metal", "Metal Processing Tools"]	t	t	Light		Classic	2026-07-25 09:11:35.912	2026-07-30 08:26:55.005	[{"url": "/uploads/booth-documents/68fa1de2-2ef8-4101-92ef-b791dd902e36.pdf", "name": "刀具电子样本.pdf", "size": 22134103, "type": "application/pdf"}, {"url": "/uploads/booth-documents/2592f394-3263-471d-8d7b-a3eb07483766.pdf", "name": "团队切削综合产品样册202502A.pdf", "size": 33796021, "type": "application/pdf"}]
cms08caad000uo0g80xmoa5p0	cmruibk9q00024ig83uq02u99	BTH-000005	HRB Industrial & Aerospace Bearing Exhibition	\N	Harbin Bearing Manufacturing Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/d5b2eb12-bec1-4215-902e-3daa3796cde0.webp	/uploads/others/f29bfd44-d6c6-42bf-9bd8-cf9a780c8f55.webp	["Harbin Bearing", "Rodamientos Harbin", "Roulements Harbin", "محامل هاربين، محامل إتش آر بي، محامل صناعية، محامل فضائية، محامل كروية، محامل أسطوانية، محامل دفع، محامل سيارات، محامل سكك حديد، مصنع المحامل، قطع نقل الماكينات", "Rolamentos Harbin", "Vòng bi Cáp Nhĩ", "Bantalan Harbin", "ลูกปืนฮาร์บิน, ลูกปืน HRB", "Harbin Lager", "Harbin Rulman", "Makine aktarma parçaları", "Maschinenübertragungsteile", "อะไหล่ส่งกำลังเครื่องจักร", "Komponen transmisi mesin", "Bộ phận truyền động máy móc", "Peças de transmissão mecânica", "Pièces de transmission mécanique", "Piezas de transmisión mecánica", "Machinery Transmission Parts"]	t	t	Dark		Classic	2026-07-25 10:32:05.654	2026-07-30 08:18:05.202	[{"url": "/uploads/booth-documents/e6dea670-4a8c-45c9-b59a-8ed8751e0081.pdf", "name": "HRB_Bearing_Catalog_脱敏版_v2.pdf", "size": 5852255, "type": "application/pdf"}]
cmrztompm000io0g8a4bftrmx	cmruibk9q00024ig83uq02u99	BTH-000003	Yuantong Power Equipment Expo 2026	\N	Jiangsu Yuantong Electric Co., Ltd.	\N	High-tech zone, Haian city, Jiangsu province, China	/uploads/others/e6a6257a-b61d-4761-a4a4-6f2a146abf36.webp	/uploads/others/cbd1a5a4-efd5-4afa-a439-2902e44c13ce.webp	["电力变压器", "Power Transformer", "Leistungstransformator", "Vermogenstransformator", "Transformador de potencia", "Máy biến áp điện lực", "Transformateur de puissance", "電力変圧器", "محول طاقة", "配电变压器", "Distribution Transformer", "Verteiltransformator", "Distributietransformator", "Transformador de distribución", "Máy biến áp phân phối", "Transformateur de distribution", "配電変圧器", "محول توزيع", "干式变压器", "Dry‑type Transformer", "Trockentransformator", "Droge transformator", "Transformador tipo seco", "Máy biến áp khô", "Transformateur à sec", "乾式変圧器", "محول جاف", "Oil‑immersed Transformer", "Öltransformator", "Oliegevulde transformator", "Transformador sumergido en aceite"]	t	t	Light		Classic	2026-07-25 03:41:47.386	2026-07-30 08:31:22.284	[{"url": "/uploads/booth-documents/ce77047f-11d9-43a8-8a27-27d1476af4ca.pdf", "name": "Yuantong_Transformer.pdf", "size": 35596361, "type": "application/pdf"}]
cms4pa6yy000bwfg8iwlllvui	cmruibk9q00024ig83uq02u99	BTH-000007	POWER GROMMET EXPO 2026	\N	Taizhou Huihuan International Trading Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/502fc43b-a9d6-4182-ad0a-95e9b2836047.webp	/uploads/others/859cd76f-058d-4653-9957-879115f1d9b4.webp	["desk power grommet", "recessed power outlet", "desktop charging station", "flush mount power strip", "desk socket with USB", "furniture power outlet", "table power grommet", "pop up desk socket", "office desk power strip", "embedded power socket", "Palabra clave", "toma de corriente empotrada para escritorio", "enchufe de mesa oculto", "regleta de alimentación empotrada", "estación de carga de escritorio", "grommet de poder para muebles", "enchufe para escritorio con USB", "toma de corriente para oficina", "conector de mesa retráctil", "base de carga para escritorio", "toma de corriente de superficie", "versenkte Schreibtischsteckdose", "Tisch-Power-Grommet", "Möbelsteckdose eingebaut", "Schreibtisch Ladeanschluss", "Einbau Steckdosenleiste", "Büro Tisch Steckdose", "versteckte Steckdose Schreibtisch", "USB Steckdose Tisch", "Tisch Ladegerät Station", "Flush Mount Steckdose", "prise encastrée pour bureau", "grommet d'alimentation de table", "prise de courant pour meuble", "station de charge de bureau", "prise de table avec USB", "presa a scomparsa per scrivania", "grommet di alimentazione da tavolo", "presa per mobili incassata", "stazione di ricarica da scrivania", "presa da tavolo con USB", "tomada de mesa embutida", "grommet de alimentação para escrivaninha", "tomada para móveis embutida", "estação de carregamento de mesa", "régua de energia embutida", "デスク埋込電源コンセント", "デスクトップパワーグロメット", "家具埋込コンセント", "オフィスデスク電源タップ"]	t	t	Vibrant		Grid	2026-07-28 13:37:26.218	2026-07-28 13:37:33.164	\N
cms5ozv4c0005cbg8oooxzuk6	cmruibk9q00024ig83uq02u99	BTH-000008	Desktop Smart Screen Global Expo	\N	Taizhou Huihuan International Trading Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/1377b45f-60e6-4f19-82f5-027875265e0e.webp	/uploads/others/bd7bd11f-d0a7-43c1-a5df-bc5f5a963472.webp	["desktop smart screen", "pantalla inteligente de escritorio", "شاشة ذكية للمكتب", "écran intelligent de bureau", "intelligenter Desktop-Bildschirm", "tela inteligente de mesa", "умный настольный экран", "デスクトップスマートスクリーン", "데스크톱 스마트 스크린", "schermo intelligente da scrivania", "schermo privacy per scrivania", "책상용 프라이버시 스크린", "デスク用プライバシースクリーン", "экран конфиденциальности для стола", "tela de privacidade para mesa", "Datenschutzbildschirm für Schreibtisch", "écran de confidentialité pour bureau", "شاشة خصوصية للمكتب", "pantalla de privacidad para escritorio", "privacy screen for desk"]	t	t	Dark		Classic	2026-07-29 06:17:10.476	2026-07-29 06:17:14.45	\N
cmrxhgc6z00002gg84s2iar8a	cmruibk9q00024ig83uq02u99	BTH-000002	ZT Heavy Industry – Total Road & Bridge Equipment Expo	\N	Shandong Zhongtai Engineering Machinery Co., Ltd.	\N	No. 6, Beiyuan Road, Pingyuan County Economic Development Zone, Dezhou City, Shandong Province, China	/uploads/others/35595010-4916-475f-be3c-69686e7e7ffc.svg	/uploads/others/0fdb434b-e6bb-41f9-87cb-4b301fbf0cb8.webp	["Flat Steel Formwork", "Encofrado Plano de Acero", "Coffrage Plat en Acier", "Flache Stahlschalung", "قوالب فولاذية مسطحة", "Плоская стальная опалубка", "Fôrma Plana de Aço", "平鋼製型枠", "평강 철재 거푸집", "Cassero Piatto in Acciaio", "Circular Column Formwork", "Encofrado para Columnas Circulares", "Coffrage pour Colonnes Circulaires", "Rundstützenschalung", "قوالب أعمدة دائرية", "Круглая опалубка для колонн", "Fôrma para Colunas Circulares", "円柱型枠", "원형 기둥 거푸집", "Cassero per Colonne Circolari", "Square Pier Column Formwork", "Encofrado para Pilares Cuadrados", "Coffrage pour Piliers Carrés", "Quadratische Pfeilerschalung", "قوالب أعمدة ركائز مربعة", "Квадратная опалубка для пилонов", "Fôrma para Pilares Quadrados", "角形ピアー型枠", "사각 교각 거푸집", "Cassero per Pilastri Quadrati", "Streamlined Pier Formwork", "Encofrado para Pilares Aerodinámicos", "Coffrage pour Piliers Profilés"]	t	t	Dark		Modern	2026-07-23 12:23:52.763	2026-07-30 08:07:23.809	[{"url": "/uploads/booth-documents/50e8d30d-9084-4ee9-9018-8a8fb1cd2fa7.pdf", "name": "中泰钢模板产品画册2026_已修改.pdf", "size": 14705455, "type": "application/pdf"}, {"url": "/uploads/booth-documents/a2739f75-3b61-4d01-b3f8-7311eef783aa.pdf", "name": "资质文件（山东中泰工程机械有限公司）(1).pdf", "size": 2452787, "type": "application/pdf"}]
cms7a86hb000atdg8ip99787w	cmruibk9q00024ig83uq02u99	BTH-000009	Global Film Materials Expo	\N	Taizhou Huihuan International Trading Co., Ltd.	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	/uploads/others/e26f3daf-2706-4a11-8854-2f7da5ddfc93.webp	/uploads/others/ec5bd6f7-9c70-40f5-9408-05267e3ba8af.webp	["Plastic Film", "Kunststofffolie", "塑料薄膜", "Film Plastique", "Película de Plástico", "Film in Plastica", "Folia z Tworzywa Sztucznego", "Plastic Folie", "플라스틱 필름", "Peullaseutik Pilreum", "プラスチックフィルム", "Purasuchikku Firumu"]	t	t	Professional		Minimal	2026-07-30 08:59:16.559	2026-07-30 09:11:21.441	[{"url": "/uploads/booth-documents/a6dd9452-3461-4132-be69-e037a7fd76e3.pdf", "name": "薄膜检测单(7-6).pdf", "size": 203852, "type": "application/pdf"}, {"url": "/uploads/booth-documents/3b93f479-c394-4f31-b8d5-982a29d24e53.pdf", "name": "常规涂覆板2026年检报告.pdf", "size": 1065249, "type": "application/pdf"}, {"url": "/uploads/booth-documents/8054139e-3cdf-4e1a-a7b1-e10f30e5b69d.pdf", "name": "PC薄膜+PAHs  多环中文(1).pdf", "size": 3294533, "type": "application/pdf"}]
\.


--
-- Data for Name: BoothCustomization; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."BoothCustomization" (id, "sellerId", type, value, config, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BoothView; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."BoothView" (id, "sellerId", "viewerId", duration, interactions, referrer, "deviceType", country, city, "viewedAt") FROM stdin;
\.


--
-- Data for Name: BrochureDownload; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."BrochureDownload" (id, "userId", "brochureType", "brochureId", "downloadedAt", "ipAddress") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Category" (id, name, "nameEn", slug, level, "parentId", model, "modelEn", series, "seriesEn", description, "descriptionEn", "hsCode") FROM stdin;
cmrq5qs8x0000yzg87xzdkyl1	电子产品	Electronics	electronics	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qs940001yzg8n69xlqyi	消费电子	Consumer Electronics	consumer-electronics	2	cmrq5qs8x0000yzg87xzdkyl1	\N	\N	\N	\N	\N	\N	\N
cmrq5qs990002yzg8oz56srw1	手机	Mobile Phones	mobile-phones	3	cmrq5qs940001yzg8n69xlqyi	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9c0003yzg8jtoxzei3	智能手机	Smart Phones	smart-phones	4	cmrq5qs990002yzg8oz56srw1	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9f0004yzg8n4xp34a1	旗舰手机	Flagship Phones	flagship-phones	5	cmrq5qs9c0003yzg8jtoxzei3	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9i0005yzg8mug7bju9	中端手机	Mid-range Phones	mid-range-phones	5	cmrq5qs9c0003yzg8jtoxzei3	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9l0006yzg8dcoccrag	功能手机	Feature Phones	feature-phones	4	cmrq5qs990002yzg8oz56srw1	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9o0007yzg8glej6qgt	平板电脑	Tablets	tablets	3	cmrq5qs940001yzg8n69xlqyi	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9r0008yzg84h1d8h9f	安卓平板	Android Tablets	android-tablets	4	cmrq5qs9o0007yzg8glej6qgt	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9u0009yzg89pn9txuv	iPad	iPad	ipad	4	cmrq5qs9o0007yzg8glej6qgt	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9x000ayzg8jsu2ilhl	笔记本电脑	Laptops	laptops	3	cmrq5qs940001yzg8n69xlqyi	\N	\N	\N	\N	\N	\N	\N
cmrq5qs9z000byzg8712og7gm	游戏本	Gaming Laptops	gaming-laptops	4	cmrq5qs9x000ayzg8jsu2ilhl	\N	\N	\N	\N	\N	\N	\N
cmrq5qsa1000cyzg8226qvnj6	轻薄本	Ultrabooks	ultrabooks	4	cmrq5qs9x000ayzg8jsu2ilhl	\N	\N	\N	\N	\N	\N	\N
cmrq5qsa5000dyzg8zsenayfi	耳机	Headphones	headphones	3	cmrq5qs940001yzg8n69xlqyi	\N	\N	\N	\N	\N	\N	\N
cmrq5qsaa000eyzg8m0i8bp1q	无线耳机	Wireless Headphones	wireless-headphones	4	cmrq5qsa5000dyzg8zsenayfi	\N	\N	\N	\N	\N	\N	\N
cmrq5qsah000fyzg803rwk04u	有线耳机	Wired Headphones	wired-headphones	4	cmrq5qsa5000dyzg8zsenayfi	\N	\N	\N	\N	\N	\N	\N
cmrq5qsao000gyzg8wqkydx32	智能穿戴	Wearables	wearables	2	cmrq5qs8x0000yzg87xzdkyl1	\N	\N	\N	\N	\N	\N	\N
cmrq5qsas000hyzg8cjzhj7dc	智能手表	Smart Watches	smart-watches	3	cmrq5qsao000gyzg8wqkydx32	\N	\N	\N	\N	\N	\N	\N
cmrq5qsau000iyzg8jeeuqws3	运动手环	Fitness Bands	fitness-bands	3	cmrq5qsao000gyzg8wqkydx32	\N	\N	\N	\N	\N	\N	\N
cmrq5qsax000jyzg8ia205gtq	机械设备	Machinery	machinery	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsaz000kyzg8ihmblxvm	工业机械	Industrial Machinery	industrial-machinery	2	cmrq5qsax000jyzg8ia205gtq	\N	\N	\N	\N	\N	\N	\N
cmrq5qsb1000lyzg8hcoyjnzc	包装机械	Packaging Machines	packaging-machines	3	cmrq5qsaz000kyzg8ihmblxvm	\N	\N	\N	\N	\N	\N	\N
cmrq5qsb3000myzg8ofcwlevm	封口机	Sealing Machines	sealing-machines	4	cmrq5qsb1000lyzg8hcoyjnzc	\N	\N	\N	\N	\N	\N	\N
cmrq5qsb6000nyzg84reh1pcx	打包机	Packaging Machines	packing-machines	4	cmrq5qsb1000lyzg8hcoyjnzc	\N	\N	\N	\N	\N	\N	\N
cmrq5qsb9000oyzg8qq5uwmpy	印刷机械	Printing Machines	printing-machines	3	cmrq5qsaz000kyzg8ihmblxvm	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbb000pyzg85tcexy7c	数码印刷机	Digital Printing Machines	digital-printing-machines	4	cmrq5qsb9000oyzg8qq5uwmpy	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbd000qyzg8hgpevxio	建筑机械	Construction Machinery	construction-machinery	2	cmrq5qsax000jyzg8ia205gtq	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbg000ryzg8fwd38vnu	挖掘机	Excavators	excavators	3	cmrq5qsbd000qyzg8hgpevxio	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbi000syzg8weqjklad	装载机	Loaders	loaders	3	cmrq5qsbd000qyzg8hgpevxio	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbk000tyzg84xjuuopy	原材料	Raw Materials	raw-materials	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbm000uyzg804wtnp41	金属材料	Metal Materials	metal-materials	2	cmrq5qsbk000tyzg84xjuuopy	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbo000vyzg80jvaick9	钢材	Steel	steel	3	cmrq5qsbm000uyzg804wtnp41	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbq000wyzg83sz7dni7	钢板	Steel Plates	steel-plates	4	cmrq5qsbo000vyzg80jvaick9	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbs000xyzg8fgkatd35	钢管	Steel Pipes	steel-pipes	4	cmrq5qsbo000vyzg80jvaick9	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbu000yyzg8hksejuzf	钢筋	Steel Rebar	steel-rebar	4	cmrq5qsbo000vyzg80jvaick9	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbw000zyzg82ftonwnn	铝材	Aluminum	aluminum	3	cmrq5qsbm000uyzg804wtnp41	\N	\N	\N	\N	\N	\N	\N
cmrq5qsbz0010yzg8j1wyfgmh	铝板	Aluminum Sheets	aluminum-sheets	4	cmrq5qsbw000zyzg82ftonwnn	\N	\N	\N	\N	\N	\N	\N
cmrq5qsc00011yzg8mf1nwk9d	铝型材	Aluminum Profiles	aluminum-profiles	4	cmrq5qsbw000zyzg82ftonwnn	\N	\N	\N	\N	\N	\N	\N
cmrq5qsc30012yzg8a7ft44dr	化工原料	Chemical Materials	chemical-materials	2	cmrq5qsbk000tyzg84xjuuopy	\N	\N	\N	\N	\N	\N	\N
cmrq5qsc50013yzg89msja0kj	塑料原料	Plastic Raw Materials	plastic-raw-materials	3	cmrq5qsc30012yzg8a7ft44dr	\N	\N	\N	\N	\N	\N	\N
cmrq5qsc70014yzg8ega1px46	PP	PP	pp-plastic	4	cmrq5qsc50013yzg89msja0kj	\N	\N	\N	\N	\N	\N	\N
cmrq5qsc90015yzg8iilm75kd	PE	PE	pe-plastic	4	cmrq5qsc50013yzg89msja0kj	\N	\N	\N	\N	\N	\N	\N
cmrq5qscb0016yzg8ux041tvl	PVC	PVC	pvc-plastic	4	cmrq5qsc50013yzg89msja0kj	\N	\N	\N	\N	\N	\N	\N
cmrq5qscd0017yzg8mejcuvd8	家居用品	Home & Garden	home-garden	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qscf0018yzg8oq8l9nin	厨房用品	Kitchen Supplies	kitchen-supplies	2	cmrq5qscd0017yzg8mejcuvd8	\N	\N	\N	\N	\N	\N	\N
cmrq5qsch0019yzg8926selyw	餐具	Tableware	tableware	3	cmrq5qscf0018yzg8oq8l9nin	\N	\N	\N	\N	\N	\N	\N
cmrq5qscj001ayzg8vj8nsbih	碗盘	Bowls & Plates	bowls-plates	4	cmrq5qsch0019yzg8926selyw	\N	\N	\N	\N	\N	\N	\N
cmrq5qscl001byzg8232cqhtz	餐具套装	Tableware Sets	tableware-sets	4	cmrq5qsch0019yzg8926selyw	\N	\N	\N	\N	\N	\N	\N
cmrq5qscn001cyzg8p3e2g9sn	厨具	Kitchen Tools	kitchen-tools	3	cmrq5qscf0018yzg8oq8l9nin	\N	\N	\N	\N	\N	\N	\N
cmrq5qscp001dyzg8k2rpvv8u	锅具	Cookware	cookware	4	cmrq5qscn001cyzg8p3e2g9sn	\N	\N	\N	\N	\N	\N	\N
cmrq5qscr001eyzg8o7ne1jlq	刀具	Knives	knives	4	cmrq5qscn001cyzg8p3e2g9sn	\N	\N	\N	\N	\N	\N	\N
cmrq5qscu001fyzg8dehb5wyi	家具	Furniture	furniture	2	cmrq5qscd0017yzg8mejcuvd8	\N	\N	\N	\N	\N	\N	\N
cmrq5qscw001gyzg8teq2ubt1	沙发	Sofas	sofas	3	cmrq5qscu001fyzg8dehb5wyi	\N	\N	\N	\N	\N	\N	\N
cmrq5qscz001hyzg8gu3qheyn	真皮沙发	Leather Sofas	leather-sofas	4	cmrq5qscw001gyzg8teq2ubt1	\N	\N	\N	\N	\N	\N	\N
cmrq5qsd3001iyzg8koqkvhx8	布艺沙发	Fabric Sofas	fabric-sofas	4	cmrq5qscw001gyzg8teq2ubt1	\N	\N	\N	\N	\N	\N	\N
cmrq5qsd6001jyzg84jpulo9d	椅子	Chairs	chairs	3	cmrq5qscu001fyzg8dehb5wyi	\N	\N	\N	\N	\N	\N	\N
cmrq5qsd9001kyzg8tgibaa8i	办公椅	Office Chairs	office-chairs	4	cmrq5qsd6001jyzg84jpulo9d	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdb001lyzg8eokg689o	餐椅	Dining Chairs	dining-chairs	4	cmrq5qsd6001jyzg84jpulo9d	\N	\N	\N	\N	\N	\N	\N
cmrq5qsde001myzg885svjeny	服装	Clothing	clothing	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdg001nyzg8e36jjnsx	男装	Men's Clothing	mens-clothing	2	cmrq5qsde001myzg885svjeny	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdi001oyzg8x6rzsc0o	衬衫	Shirts	shirts	3	cmrq5qsdg001nyzg8e36jjnsx	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdl001pyzg8awbeevn9	T恤	T-shirts	t-shirts	3	cmrq5qsdg001nyzg8e36jjnsx	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdn001qyzg84tl069at	女装	Women's Clothing	womens-clothing	2	cmrq5qsde001myzg885svjeny	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdp001ryzg87twzqnk4	连衣裙	Dresses	dresses	3	cmrq5qsdn001qyzg84tl069at	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdr001syzg86gsscb1y	上衣	Tops	tops	3	cmrq5qsdn001qyzg84tl069at	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdt001tyzg8zl7wagpf	鞋靴	Shoes	shoes	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdv001uyzg8zdvnf1t6	运动鞋	Sports Shoes	sports-shoes	2	cmrq5qsdt001tyzg8zl7wagpf	\N	\N	\N	\N	\N	\N	\N
cmrq5qsdy001vyzg82l2q3ppd	跑鞋	Running Shoes	running-shoes	3	cmrq5qsdv001uyzg8zdvnf1t6	\N	\N	\N	\N	\N	\N	\N
cmrq5qse2001wyzg8o9eivhhj	篮球鞋	Basketball Shoes	basketball-shoes	3	cmrq5qsdv001uyzg8zdvnf1t6	\N	\N	\N	\N	\N	\N	\N
cmrq5qse5001xyzg8wzm4lmwy	休闲鞋	Casual Shoes	casual-shoes	2	cmrq5qsdt001tyzg8zl7wagpf	\N	\N	\N	\N	\N	\N	\N
cmrq5qse7001yyzg879cytq3r	皮鞋	Leather Shoes	leather-shoes	3	cmrq5qse5001xyzg8wzm4lmwy	\N	\N	\N	\N	\N	\N	\N
cmrq5qsea001zyzg8x8r3g8z0	帆布鞋	Canvas Shoes	canvas-shoes	3	cmrq5qse5001xyzg8wzm4lmwy	\N	\N	\N	\N	\N	\N	\N
cmrq5qsec0020yzg8y4dsw6s9	纺织品	Textiles	textiles	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsee0021yzg81ajrvn4x	面料	Fabrics	fabrics	2	cmrq5qsec0020yzg8y4dsw6s9	\N	\N	\N	\N	\N	\N	\N
cmrq5qseh0022yzg8pskv4gur	棉面料	Cotton Fabric	cotton-fabric	3	cmrq5qsee0021yzg81ajrvn4x	\N	\N	\N	\N	\N	\N	\N
cmrq5qsej0023yzg87qkay8hw	涤纶面料	Polyester Fabric	polyester-fabric	3	cmrq5qsee0021yzg81ajrvn4x	\N	\N	\N	\N	\N	\N	\N
cmrq5qsel0024yzg8bsfkb4yg	窗帘	Curtains	curtains	2	cmrq5qsec0020yzg8y4dsw6s9	\N	\N	\N	\N	\N	\N	\N
cmrq5qseo0025yzg84ab5dedr	建材	Building Materials	building-materials	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qseq0026yzg823yureby	瓷砖	Tiles	tiles	2	cmrq5qseo0025yzg84ab5dedr	\N	\N	\N	\N	\N	\N	\N
cmrq5qset0027yzg8dv0tppzr	地砖	Floor Tiles	floor-tiles	3	cmrq5qseq0026yzg823yureby	\N	\N	\N	\N	\N	\N	\N
cmrq5qsew0028yzg8vqglul3c	墙砖	Wall Tiles	wall-tiles	3	cmrq5qseq0026yzg823yureby	\N	\N	\N	\N	\N	\N	\N
cmrq5qsez0029yzg89sybw7j0	涂料	Paints	paints	2	cmrq5qseo0025yzg84ab5dedr	\N	\N	\N	\N	\N	\N	\N
cmrq5qsf6002ayzg809gcpdkb	乳胶漆	Latex Paint	latex-paint	3	cmrq5qsez0029yzg89sybw7j0	\N	\N	\N	\N	\N	\N	\N
cmrq5qsf9002byzg8vhggeh21	防水涂料	Waterproof Paint	waterproof-paint	3	cmrq5qsez0029yzg89sybw7j0	\N	\N	\N	\N	\N	\N	\N
cmrq5qsff002cyzg8w4rr0gym	汽车配件	Auto Parts	auto-parts	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsfk002dyzg807v3w046	轮胎	Tires	tires	2	cmrq5qsff002cyzg8w4rr0gym	\N	\N	\N	\N	\N	\N	\N
cmrq5qsfo002eyzg8q1eq46sg	机油	Engine Oil	engine-oil	2	cmrq5qsff002cyzg8w4rr0gym	\N	\N	\N	\N	\N	\N	\N
cmrq5qsfr002fyzg8ff0ymwc8	医疗器械	Medical Devices	medical-devices	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsfu002gyzg8c8qoudup	诊断设备	Diagnostic Equipment	diagnostic-equipment	2	cmrq5qsfr002fyzg8ff0ymwc8	\N	\N	\N	\N	\N	\N	\N
cmrq5qsfx002hyzg8g5z4t22v	治疗设备	Treatment Equipment	treatment-equipment	2	cmrq5qsfr002fyzg8ff0ymwc8	\N	\N	\N	\N	\N	\N	\N
cmrq5qsfz002iyzg846biroc9	农产品	Agricultural Products	agricultural-products	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsg2002jyzg8m5dqgtbw	粮食	Grain	grain	2	cmrq5qsfz002iyzg846biroc9	\N	\N	\N	\N	\N	\N	\N
cmrq5qsg5002kyzg8b0mnuy7d	水果	Fruits	fruits	2	cmrq5qsfz002iyzg846biroc9	\N	\N	\N	\N	\N	\N	\N
cmrq5qsg8002lyzg8tl6en9ft	能源	Energy	energy	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsga002myzg8qynixou4	太阳能	Solar Energy	solar-energy	2	cmrq5qsg8002lyzg8tl6en9ft	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgc002nyzg8kfkuf4ta	风能	Wind Energy	wind-energy	2	cmrq5qsg8002lyzg8tl6en9ft	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgf002oyzg8mst9g7xc	包装	Packaging	packaging	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgi002pyzg89xat26e7	纸箱	Carton Boxes	carton-boxes	2	cmrq5qsgf002oyzg8mst9g7xc	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgk002qyzg8vtm5t1b3	塑料包装	Plastic Packaging	plastic-packaging	2	cmrq5qsgf002oyzg8mst9g7xc	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgm002ryzg8ecy1cgci	玩具	Toys	toys	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgp002syzg8s8bv0mk0	益智玩具	Educational Toys	educational-toys	2	cmrq5qsgm002ryzg8ecy1cgci	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgr002tyzg8wd08136d	电子玩具	Electronic Toys	electronic-toys	2	cmrq5qsgm002ryzg8ecy1cgci	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgu002uyzg8wtzh60mu	礼品	Gifts	gifts	1	\N	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgw002vyzg8yhqq8f52	节日礼品	Holiday Gifts	holiday-gifts	2	cmrq5qsgu002uyzg8wtzh60mu	\N	\N	\N	\N	\N	\N	\N
cmrq5qsgy002wyzg8hs7m0lo5	商务礼品	Business Gifts	business-gifts	2	cmrq5qsgu002uyzg8wtzh60mu	\N	\N	\N	\N	\N	\N	\N
cmrq8ijsl0002cxg8sya8v5kg	铝合金挤压型材	Aluminum Alloy Extruded Profiles	category-1784371156144	3	cmrq8hzxf0001cxg8yqo7aoez							
cmrq8izno0003cxg8rbpx3fav	铝方通 / 铝方管	Aluminum Louvers / Square Tubes	--	4	cmrq8ijsl0002cxg8sya8v5kg							
cmrq8hzxf0001cxg8yqo7aoez	金属装饰材料	Metal Decorative Materials		2	cmrq5qseo0025yzg84ab5dedr							
cmrq8oggd0004cxg80t1dlfti	木纹铝方通	Wood Grain Aluminum Square Tube	category-1784371431752	5	cmrq8izno0003cxg8rbpx3fav							
cmrq8p25z0005cxg859ptcz81	铝合金方管	Aluminum Alloy Square Tube	category-1784371459889	5	cmrq8izno0003cxg8rbpx3fav							
cmrq8pmty0006cxg84r37sj0i	铝合金U型槽	Aluminum Alloy U-Channel	u	5	cmrq8izno0003cxg8rbpx3fav							
cmrq8q6lj0007cxg88gkygx8v	铝合金圆管	Aluminum Alloy Round Tube	category-1784371512289	5	cmrq8izno0003cxg8rbpx3fav							
cmrq8r7zu0008cxg86mcwe7sf	铝合金角铝	Aluminum Alloy Angle	category-1784371560754	5	cmrq8izno0003cxg8rbpx3fav							
cmrrampt80000z5g89gv4ocvk	第六类 - 化学工业及其相关工业的产品	Section VI - Products of the Chemical or Allied Industries	---	1	\N							
cmrraou7d0002z5g87rhoez2b	第二十九章 - 有机化学品	Chapter 29 - Organic Chemicals	----1784435274945	2	cmrrampt80000z5g89gv4ocvk							
cmrrapb060003z5g8fpf2uj4f	29.18 - 含附加含氧基的羧酸及其酸酐等	Heading 2918 - Carboxylic acids with additional oxygen function	2918---	3	cmrraou7d0002z5g87rhoez2b							
cmrraq2oh0004z5g8n48sb4wy	2918.30 - 醛酸、酮酸等	Subheading 2918.30 - Carboxylic acids with aldehyde or ketone function	291830---	4	cmrrapb060003z5g8fpf2uj4f							
cmrraqpl70005z5g8xo1g0a7z	2918300011 - 除虫菊素I、除虫菊素II	2918300011 - Pyrethrum I, Pyrethrum II	2918300011---iii	5	cmrraq2oh0004z5g8n48sb4wy							
cmrsq7dxf0002j6g8c62l0z1u	第七类\t塑料及其制品；橡胶及其制品	Section VII – Plastics and articles thereof; rubber and articles thereof	-	1	\N							
cmrsq8hf30003j6g8448inzwo	39章\t塑料及其制品	Chapter 39 – Plastics and articles thereof	39-	2	cmrsq7dxf0002j6g8c62l0z1u							
cmrsqmwcd0004j6g8smgzi7tf	3920\t其他非泡沫塑料的板、片、膜、箔及扁条，未用其他材料强化、层压、支撑或用类似方法合制	Heading 39.20 – Other plates, sheets, film, foil and strip, of non‑cellular plastics, not reinforced, laminated, supported or similarly combined with other materials	3920-	3	cmrsq8hf30003j6g8448inzwo							
cmrsqnpix0005j6g8obq7gjj6	392061\t聚碳酸酯制板、片、膜、箔及扁条	\tSubheading 3920.61 – Of polycarbonates	392061-	4	cmrsqmwcd0004j6g8smgzi7tf							
cmrsqozue0006j6g8qthgrlzl	39206100\t聚碳酸酯制板、片、膜、箔及扁条（非泡沫料，未强化、层压、支撑等）	Subheading 3920.61.00 – Plates, sheets, film, foil and strip, of polycarbonates, non‑cellular, not reinforced, laminated, supported or similarly combined	39206100-	5	cmrsqnpix0005j6g8obq7gjj6							39206100
cmrunffmc0000u5g8s7rb6jzn	第15类 贱金属及其制品	Section XV: Base Metals and Articles Thereof	15-	1	\N							
cmrung7yd0001u5g8vvov5pbc	第76章 铝及其制品	Chapter 76: Aluminium and Articles Thereof	76-	2	cmrunffmc0000u5g8s7rb6jzn							76
cmrungty60002u5g87wivhry1	未锻轧铝	Unwrought Aluminium	category-1784638134923	3	cmrung7yd0001u5g8vvov5pbc							7601
cmrunigy60003u5g8ypj88qy3	\t未锻轧非合金铝	Unwrought Aluminium, Not Alloyed	--1784638211393	4	cmrungty60002u5g87wivhry1							760110
cmrunjn3z0004u5g8lswspswy	铝锭（含铝量≥99.95%）	Unwrought Aluminium, Not Alloyed, Containing ≥99.95% Aluminium by Weight	9995	5	cmrunigy60003u5g8ypj88qy3							76011010
cmrunkfpy0005u5g8u1apy3gh	其他未锻轧非合金铝（含铝量＜99.95%）	Other Unwrought Aluminium, Not Alloyed	9995-1784638303124	5	cmrunigy60003u5g8ypj88qy3							76011090
cmrxhydi40000o0g8kv6z1ehr	路桥施工装备	Road & Bridge Construction Equipment	category-1784810274241	1	\N							
cmrxi0foz0001o0g8fnwu4fk4	钢模板系统	Steel Formwork System	category-1784810370367	2	cmrxhydi40000o0g8kv6z1ehr							
cmrxi2r9f0002o0g8hctxhb3g	平面模板	Flat Steel Formwork	category-1784810478690	3	cmrxi0foz0001o0g8fnwu4fk4							
cmrxj1hij0004o0g829qzkom0	桥梁模板	Bridge Formworks	category-1784812099027	3	cmrxi0foz0001o0g8fnwu4fk4							
cmrxj31t60005o0g8yjykmjxs	\tPile Cap Formwork	承台模板	-pile-cap-formwork	4	cmrxj1hij0004o0g829qzkom0							
cmrxjkhut0007o0g8gl3pdbse	圆柱模板	Circular Column Formwork	category-1784812985942	4	cmrxj1hij0004o0g829qzkom0							
cmrzr2i6y000bo0g85lckedav	电气设备	Electrical Equipment	category-1784946515843	1	\N							
cmrzr3bwb000co0g8k5kwhaz5	输变电设备	Power Transmission & Distribution Equipment	category-1784946554341	2	cmrzr2i6y000bo0g85lckedav							
cmrzr6uar000fo0g88lbnriej	变压器	Transformer	category-1784946718157	3	cmrzr3bwb000co0g8k5kwhaz5							
cmrzr9hpe000go0g8s9782pvw	电力变压器 / 配电变压器	Power Transformer / Distribution Transformer	---1784946841817	4	cmrzr6uar000fo0g88lbnriej							
cmrzrang0000ho0g8s3agld6z	油浸式变压器、干式变压器、柱上变压器、箱式变电站、特种变压器等	Oil-immersed Transformer, Dry-type Transformer, Pole Mounted Transformer, Box Type Substation, Special Transformer, etc.	category-1784946895909	5	cmrzr9hpe000go0g8s9782pvw							
cmrzyz7zb000no0g8mu03o2ls	醇类	Alcohols	category-1784959799566	3	cmrraou7d0002z5g87rhoez2b							
cmrzz1748000po0g8l04ncjkd	甲醇	Methanol / Methyl Alcohol	category-1784959891764	4	cmrzyz7zb000no0g8mu03o2ls							
cmrzz2ru7000qo0g8rkloh24w	工业级高纯度 Ⅰ 型甲醇（99.99% GB/T338-2025）	Industrial Grade High Purity Type I Methanol 99.99% (GB/T338-2025)	--9999-gbt338-2025	5	cmrzz1748000po0g8l04ncjkd							
cms08n1lw000vo0g8w8jstnx2	工业与科学	Industrial & Scientific	category-1784976027612	1	\N							
cms08nms4000wo0g8szktdphl	动力传动产品	Power Transmission Products	category-1784976055041	2	cms08n1lw000vo0g8w8jstnx2							
cms08o4zx000xo0g85nbks8fs	轴承	Bearings	category-1784976078662	3	cms08nms4000wo0g8szktdphl							
cms08payw000yo0g82e89qxv0	球轴承	Ball Bearings	category-1784976133043	4	cms08o4zx000xo0g85nbks8fs							
cms08py7b000zo0g8wnuibel3	深沟球轴承	Deep Groove Ball Bearings	category-1784976163167	5	cms08payw000yo0g82e89qxv0							
cms08qn5o0010o0g8cm4gwu33	调心球轴承	Self-Aligning Ball Bearings	category-1784976195490	5	cms08payw000yo0g82e89qxv0							
cms08r83u0011o0g82n4nt7hs	角接触球轴承	Angular Contact Ball Bearings	category-1784976222657	5	cms08payw000yo0g82e89qxv0							
cms08ruib0012o0g80oybjx7x	滚子轴承	Roller Bearings	category-1784976251676	4	cms08o4zx000xo0g85nbks8fs							
cms08sg6d0013o0g86oo5h7kd	圆柱滚子轴承	Cylindrical Roller Bearings	category-1784976279771	5	cms08ruib0012o0g80oybjx7x							
cms08t27i0014o0g86o3kl61n	调心滚子轴承	Spherical Roller Bearings	category-1784976308309	5	cms08ruib0012o0g80oybjx7x							
cms08toua0015o0g80xzzwy7b	圆锥滚子轴承	Tapered Roller Bearings	category-1784976337659	5	cms08ruib0012o0g80oybjx7x							
cms08udxm0016o0g8yp3fyssq	推力轴承	Thrust Bearings	category-1784976370158	4	cms08o4zx000xo0g85nbks8fs							
cms08vg5w0017o0g8g7z0enca	推力球轴承	Thrust Ball Bearings	category-1784976419711	5	cms08udxm0016o0g8yp3fyssq							
cms08w26i0018o0g8lwdiv67c	推力调心滚子轴承	Spherical Thrust Roller Bearings	category-1784976448246	5	cms08udxm0016o0g8yp3fyssq							
cms08wmo40019o0g8hqy40n3e	专用及特种轴承	Specialty Bearings	category-1784976474800	4	cms08o4zx000xo0g85nbks8fs							
cms08zayy001bo0g8tfo5t0ur	精密组合轴承	Precision Combination Bearings	category-1784976599604	5	cms08wmo40019o0g8hqy40n3e							
cms0903kq001co0g8hmqhe5ot	直线运动轴承	Linear Motion Bearings	category-1784976636685	5	cms08wmo40019o0g8hqy40n3e							
cms090opi001do0g8wvq2cyeh	汽车轮毂轴承	Hub Bearings	category-1784976664062	5	cms08wmo40019o0g8hqy40n3e							
cms091c7r001eo0g8rmupgfsr	涡轮增压器轴承	Turbocharger Bearings	category-1784976694543	5	cms08wmo40019o0g8hqy40n3e							
cms4j8ot60000t0g8fvtfe4q7	切削刀具	Cutting Tools	category-1785235698228	2	cms08n1lw000vo0g8w8jstnx2							
cms4j9a8l0001t0g8m0uheq5p	铣削配件	Milling Accessories	category-1785235726093	3	cms4j8ot60000t0g8fvtfe4q7							
cms4jafn10000jeg8bmdz934d	\t立铣刀 	 End Mills	---1785235779669	4	cms4j9a8l0001t0g8m0uheq5p							
cms4jb29z0002jeg89gr2q7qs	快进给立铣刀	High Feed End Mills	category-1785235809060	5	cms4jafn10000jeg8bmdz934d							
cms4nnrrz0001wfg8w4lh2uz8	工具与家居装修	Tools & Home Improvement	category-1785243120452	1	\N							
cms4no8bj0002wfg89hpumx84	安全与安防	Safety & Security	category-1785243141873	2	cms4nnrrz0001wfg8w4lh2uz8							
cms4nozbv0003wfg8xjtipr3i	\t消防与生命安全	Fire & Life Safety	--1785243176916	3	cms4no8bj0002wfg89hpumx84							
cms4npk9g0004wfg8l6reipa8	灭火系统	\tFire Suppression Systems	category-1785243204024	4	cms4nozbv0003wfg8xjtipr3i							
cms4nq1rb0005wfg8iu4i71fj	柜式气体灭火装置	Cabinet Gas Fire Extinguishing Devices	category-1785243226707	5	cms4npk9g0004wfg8l6reipa8							
cms4oweos0007wfg8ejvty42d	\t电脑与配件	Computers & Accessories	--1785245203028	2	cmrq5qs8x0000yzg87xzdkyl1							
cms4oxcky0008wfg89qtzv378	\t配件与耗材	Accessories & Supplies	--1785245246958	3	cms4oweos0007wfg8ejvty42d							
cms4oyg7u0009wfg81s72xht4	电源板与电涌保护器	Power Strips & Surge Protectors	category-1785245298303	4	cms4oxcky0008wfg89qtzv378							
cms4oz305000awfg8uh6yj68t	\t桌面嵌入式电源插座	Desk Recessed Power Outlets / Desk Power Grommets	--1785245327856	5	cms4oyg7u0009wfg81s72xht4							
cms5mpr320000cbg8eslwpk4o	家具	Furniture	category-1785301999437	1	\N							
cms5mqgn40001cbg8tkoi680v	办公家具	Office Furniture	category-1785302032530	2	cms5mpr320000cbg8eslwpk4o							
cms5mr4r70002cbg8ng4yztng	桌面与工位隔断	Desk & Workspace Dividers	category-1785302063821	3	cms5mqgn40001cbg8tkoi680v							
cms5mrrsh0003cbg8o7pr5m8a	桌面隔离屏障	Desktop Separation Barriers	category-1785302093659	4	cms5mr4r70002cbg8ng4yztng							
cms5mskzu0004cbg89jfsvtwq	屏幕式桌面隔断	Screen-Type Desk Dividers	category-1785302131487	5	cms5mrrsh0003cbg8o7pr5m8a							
cms714lh2000a80g8bz5uk8p1	薄膜材料	Film Materials	category-1785386672767	2	cmrq5qsbk000tyzg84xjuuopy							
cms73428w00009ag8gt4a7e7u	PC薄膜 	PC Film	pc-	3	cms714lh2000a80g8bz5uk8p1							
cms73c5bn00019ag8atpfucr6	光学级薄膜	Optical Grade Film	category-1785390384347	4	cms73428w00009ag8gt4a7e7u							
cms73dcj300029ag861jgj4qp	高透光型	High Light Transmission	category-1785390440334	5	cms73c5bn00019ag8atpfucr6							
cms73e21800039ag8jg4scxap	扩散型	Diffusion Type	category-1785390473386	5	cms73c5bn00019ag8atpfucr6							
cms73emsu00049ag8852pz0t9	硬化涂层型	Hard Coated Type	category-1785390500286	5	cms73c5bn00019ag8atpfucr6							
cms73g4m200069ag8tin25wxc	阻燃级	Flame Retardant Grade	category-1785390569994	4	cms73428w00009ag8gt4a7e7u							
cms73h0b400079ag8p15qcoz4	V0级阻燃	V0 Flame Retardant	v0	5	cms73g4m200069ag8tin25wxc							
cms73hl9d0000ajg8hfr25y2e	V2级阻燃	V2 Flame Retardant	v2	5	cms73g4m200069ag8tin25wxc							
cms73i9eq0001ajg8g12to2pl	通用级	General Purpose Grade	category-1785390669588	4	cms73428w00009ag8gt4a7e7u							
cms73qcdt0002ajg8hznlpr9b	高光泽型 	High Gloss Type	--1785391046699	5	cms73i9eq0001ajg8g12to2pl							
cms73qz9x0003ajg8wynyj5sc	哑光型 	 Matt Finish Type	--1785391076368	5	cms73i9eq0001ajg8g12to2pl							
cms73rkit0004ajg8fpk9ms2j	印刷级	Printing Grade	category-1785391103901	4	cms73428w00009ag8gt4a7e7u							
cms73s6il0005ajg8kag3orgt	高附着力型	High Adhesion Type	category-1785391132393	5	cms73rkit0004ajg8fpk9ms2j							
cms73sp0f0006ajg8fsmemq85	PET薄膜	PET Film	pet	3	cms714lh2000a80g8bz5uk8p1							
cms73t8b10007ajg8v07cch66	光学级 	Optical Grade	--1785391181374	4	cms73sp0f0006ajg8fsmemq85							
cms73tsc80008ajg83a6mtsau	高透光型	High Light Transmission	category-1785391207321	5	cms73t8b10007ajg8v07cch66							
cms73ub0p0009ajg8q1q3fmpy	抗眩光型	Anti-glare Type	category-1785391231513	5	cms73t8b10007ajg8v07cch66							
cms73vcxr000aajg8txw9myu5	电气绝缘级	Electrical Insulation Grade	category-1785391280679	4	cms73sp0f0006ajg8fsmemq85							
cms73wc8s00007dg8wfqffyzn	高绝缘型	High Insulation Type	category-1785391326142	5	cms73vcxr000aajg8txw9myu5							
cms73wx9t00017dg8ttktvg7b	耐高温型 	High Temperature Resistant	--1785391353706	5	cms73vcxr000aajg8txw9myu5							
cms73xn8l00027dg8da1fpajv	包装级	Packaging Grade	category-1785391387334	4	cms73sp0f0006ajg8fsmemq85							
cms73ych600037dg8pid01vbp	高透明型 	High Transparency Type	--1785391420068	5	cms73xn8l00027dg8da1fpajv							
cms73yxcq00047dg8jwahvthh	哑光型 	Matt Finish Type	--1785391447126	5	cms73xn8l00027dg8da1fpajv							
cms73ze5x00057dg8tmhuoslp	转移级	Transfer Grade	category-1785391468893	4	cms73sp0f0006ajg8fsmemq85							
cms73zxoa00067dg8aw72xe0f	高平滑型	High Smoothness Type	category-1785391494194	5	cms73ze5x00057dg8tmhuoslp							
cms740j8500077dg87c6lyes5	ABS薄膜	ABS Film	abs	3	cms714lh2000a80g8bz5uk8p1							
cms741aqd00087dg8oxeqx6q7	高光泽级	High Gloss Grade	category-1785391557752	4	cms740j8500077dg87c6lyes5							
cms741zjw00097dg85ktau6l2	高光泽型	High Gloss Type	category-1785391589934	5	cms741aqd00087dg8oxeqx6q7							
cms742ojk000a7dg8hkiq1s57	耐冲击级	Impact Resistant Grade	category-1785391622325	4	cms740j8500077dg87c6lyes5							
cms7436bz000b7dg8j2cm2d6y	高抗冲型	High Impact Type	category-1785391645365	5	cms741aqd00087dg8oxeqx6q7							
cms743s61000c7dg8l6qyv5h8	超韧型	Super Tough Type	category-1785391673667	5	cms742ojk000a7dg8hkiq1s57							
cms744ehh000d7dg8ykdk1rtk	阻燃级	Flame Retardant Grade	category-1785391702593	4	cms740j8500077dg87c6lyes5							
cms7457vj000e7dg8tmwulh1s	V0级阻燃	V0 Flame Retardant	v0-1785391740695	5	cms744ehh000d7dg8ykdk1rtk							
cms745x28000f7dg8j63x8m1u	V2级阻燃	V2 Flame Retardant	v2-1785391773340	5	cms744ehh000d7dg8ykdk1rtk							
cms79jnr30000tdg81wuu4c7i	PE薄膜	PE Film	pe	3	cms714lh2000a80g8bz5uk8p1							
cms79kc8a0001tdg85l6je1kl	包装级	Packaging Grade	category-1785400844237	4	cms79jnr30000tdg81wuu4c7i							
cms79l80b0002tdg8vjc8yhru	农业级	Agricultural Grade	category-1785400885412	4	cms79jnr30000tdg81wuu4c7i							
cms79luz20003tdg8x8s0o2hw	PP薄膜	PP Film	pp	3	cms714lh2000a80g8bz5uk8p1							
cms79mkmu0004tdg8dphgcqss	包装级	Packaging Grade	category-1785400948442	4	cms79luz20003tdg8x8s0o2hw							
cms79n2nz0005tdg8cbgv7nm2	电容级	Capacitor Grade	category-1785400971828	4	cms79luz20003tdg8x8s0o2hw							
cms79nkyu0006tdg8bc4dcejh	PVC薄膜	PVC Film	pvc	3	cms714lh2000a80g8bz5uk8p1							
cms79o4gi0007tdg87oyygp35	通用级	General Purpose Grade	category-1785401020797	4	cms79nkyu0006tdg8bc4dcejh							
cms79opqi0008tdg8uaix7811	阻燃级	Flame Retardant Grade	category-1785401048369	4	cms79nkyu0006tdg8bc4dcejh							
cms79qp9w0009tdg8r63mukw6	Multilayer Composite Film	多层复合薄膜	multilayer-composite-film	3	cms714lh2000a80g8bz5uk8p1							
\.


--
-- Data for Name: ContactView; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."ContactView" (id, "viewerId", "sellerId", "viewedAt") FROM stdin;
\.


--
-- Data for Name: DeadLink; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."DeadLink" (id, url, "sourceUrl", "statusCode", "isResolved", "resolvedAt", "detectedAt", "lastCheckedAt") FROM stdin;
\.


--
-- Data for Name: DigitalVoucher; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."DigitalVoucher" (id, "sellerId", title, description, value, currency, "redemptionCode", "isRedeemed", "redeemedById", "redeemedAt", "validFrom", "validUntil", "isVerified", "securityHash", images, terms, "createdAt", "updatedAt", "certificateNumber", documents, "goodsCategory", "goodsDescription", "goodsDimensions", "goodsName", "goodsOrigin", "goodsQuantity", "goodsSpecifications", "goodsWeight", "hashAlgorithm", "hashGeneratedAt", "issueDate", "logisticsStatus", status, "trackingNumber", "verificationStatus") FROM stdin;
\.


--
-- Data for Name: DigitalVoucherTransaction; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."DigitalVoucherTransaction" (id, "voucherId", "buyerId", amount, currency, "transactionId", "verifiedBy", "verifiedAt", "deliveryInfo", status, "createdAt", "transactionType") FROM stdin;
\.


--
-- Data for Name: GoodsVerificationRecord; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."GoodsVerificationRecord" (id, "voucherId", "verifiedBy", status, notes, images, "createdAt") FROM stdin;
\.


--
-- Data for Name: Inquiry; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Inquiry" (id, "buyerId", "sellerId", "productId", message, "contactInfo", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LogisticsUpdate; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."LogisticsUpdate" (id, "voucherId", status, location, description, "timestamp", "createdAt") FROM stdin;
\.


--
-- Data for Name: MarketplaceTask; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."MarketplaceTask" (id, title, description, type, budget, price, currency, unit, "minOrderQty", deadline, status, "postedById", "contactInfo", applications, views, rating, attachments, "createdAt", "updatedAt") FROM stdin;
cmrvouj2h00023yg8jeeoau7y	长期大量收购A00铝锭、A07铝锭，价格随行就市，诚信付款，欢迎厂商直供！We Are Buying A00 & A07 Aluminum Ingots – Large Quantities, Competitive Pricing, Reliable Payment – Contact Us Today!Закупаем алюминиевые чушки А00 и А07 крупным оптом – конкурентные цены, надёжная оплата, прямые контракты!	我司常年收购A00铝锭、A07铝锭及铝粉。我司为贸易中间商，受终端用户委托进行采购，终端用户要求以LME（伦敦金属交易所）现货结算价为基准定价。欢迎各生产厂家及供应商洽谈合作。\nWe are long‑term buyers of A00 aluminum ingots, A07 aluminum ingots, and aluminum powder. We act as a trading intermediary, procuring on behalf of our end‑user clients who require pricing based on the LME (London Metal Exchange) cash settlement price. We welcome inquiries from mills and suppliers.\nМы являемся постоянными покупателями алюминиевых чушек А00, А07 и алюминиевого порошка. Мы выступаем в качестве торгового посредника и закупаем продукцию по поручению наших конечных клиентов, которые настаивают на ценообразовании на основе котировок LME (Лондонской биржи металлов) по наличным сделкам. Приглашаем к сотрудничеству заводы и поставщиков.	MANUFACTURING	\N	\N	USD	\N	\N	\N	OPEN	cmprziifr000763g8vjb4v75f	\N	0	0	\N	[]	2026-07-22 06:15:19.817	2026-07-22 06:15:19.817
cmrxkgm380009o0g8sh8toqse	寻资方：韩国LG工厂拆除项目，70亿韩元投入，3个月净赚20亿韩元	现有韩国LG集团坡州（Paju）工厂拆除工程项目，寻找具备资金实力的投资方合作。项目位于韩国京畿道坡州LG显示（LG Display）综合工业园区。LG Display近年来持续推进业务重组，先后出售广州LCD工厂、坡州P7工厂LCD设备等资产，本次拆除项目为该园区资产处置的一部分。\n\n项目方已授权我公司发布该拆除工程的相关资源与渠道，现诚寻资金方共同推进。\n\n【投资条件】\n项目\t内容\n投资金额\t70亿韩元（约合人民币3,800万元）\n回收金额\t90亿韩元（含本金70亿+利润20亿）\n投资周期\t3个月内完成回收\n净利润\t20亿韩元（收益率约28.6%）\n\n【项目背景】\n\n    地点：韩国京畿道坡州市，LG Display坡州工厂园区\n\n    背景：LG Display近年持续进行资产重组与产线调整，坡州工厂部分设施面临拆除与改造	PRODUCT_SALE	\N	\N	USD	\N	\N	\N	OPEN	cmprziifr000763g8vjb4v75f	aardenx@outlook.com      tel:18627407019	0	0	\N	[]	2026-07-23 13:48:04.436	2026-07-23 13:48:04.436
cmrxkuavs000ao0g84ge76bgf	韩国LG/Samsung工厂PVC片材/薄膜破碎料直供 | 月供23吨起 | FOB $260-380  Korean LG/Samsung Factory PVC Sheet/Film Scrap Direct Supply | 23T/Month | FOB $260-380	中文版：\n\n    【产品名称】 韩国产PVC破碎料（片材/薄膜）\n\n    【产品来源】 本产品源自韩国LG及三星工厂生产过程中产生的回收废料，经破碎加工处理。我司已通过直接工厂实地考察确认产品品质。\n\n    【供应规格】\n    品类\t颜色\t月供应量\t价格（FOB）\n    片材（Sheet）\t白色 / 灰色\t1个集装箱（23吨）\t$360–380/吨\n    薄膜（Film）\t白色\t1个集装箱（23吨）\t$360–380/吨\n    薄膜（Film）\t混合色\t现有库存2,000吨\t$260–280/吨\n\n    【长期供应】 每年可确保3-4次约2,000吨的废料供应（需另行协商）。\n\n    【交易条款】\n\n        价格条款：FOB 仁川港 或 釜山港\n\n        交货方式：集装箱运输\n\n    【重要提示】\n\n        建议买家在议价前实地到访工厂验货\n\n        货源可能随时售罄，先到先得\n\n   \n\n英文版：\n\n    【Product Name】 Korean-Made Shredded PVC (Sheets & Film)\n\n    【Product Source】 This product is sourced from scrap recovered from SAMSUNG and LG factories in Korea, processed through shredding. Our company has verified the product quality through direct factory visits.\n\n    【Supply Specifications】\n    Category\tColor\tMonthly Supply\tPrice (FOB)\n    Sheets\tWhite / Gray\t1 container (23 tons)\t$360–380/ton\n    Film\tWhite\t1 container (23 tons)\t$360–380/ton\n    Film\tMixed\tCurrent inventory: 2,000 tons\t$260–280/ton\n\n    【Long-Term Supply】 Approximately 2,000 tons of scrap can be secured 3–4 times annually (separate negotiation required).\n\n    【Trade Terms】\n\n        Price Basis: FOB Incheon Port or Busan Port\n\n        Delivery: Container shipment\n\n    【Important Notes】\n\n        Factory visit is recommended for product inspection before negotiation\n\n        Items may be out of stock at any time – first come, first served\n	PRODUCT_SALE	\N	\N	USD	\N	\N	\N	OPEN	cmprziifr000763g8vjb4v75f	email: aardenx@outlook.com      tel: 18627407019	0	0	\N	["/uploads/task-attachments/ff710c02-c51e-45d0-99eb-66d43ff103a2.webp"]	2026-07-23 13:58:43.096	2026-07-23 13:58:43.096
cms009m8a000ro0g8w886infp	国标工业甲醇 99.99%Ⅰ 型 GB/T338 高纯度有机溶剂，Industrial Grade Methanol 99.99% Type I GB/T338 Solvent CAS 67-56-1	We supply Type I industrial methanol complying with GB/T 338-2025 national standard. The product reaches 99.99% high purity with stable quality as shown in our full inspection report. This colorless transparent liquid serves as a universal organic solvent and basic chemical raw material, widely used in chemical synthesis, industrial cleaning, coating dilution, boiler fuel and new energy production. Bulk stock and flexible supply methods are available for global industrial buyers.\n\n## Full Detailed Version (For Alibaba / Independent Website Product Page)\n\n### Product Introduction\n\nOur industrial methanol strictly follows GB/T 338-2025 standard and passes complete laboratory testing. The tested purity hits 99.99%, categorized as Type I premium grade. No visible impurities, low moisture, low acidity and excellent stability are its core advantages. Each batch comes with official quality inspection certificate to guarantee consistent performance.\n\n### Key Specifications\n\n- Appearance: Colorless transparent liquid without visible impurities\n- Purity (w%): 99.99%\n- Standard: GB/T 338-2025 Type I\n- Low moisture content: ≤0.01%\n- Long potassium permanganate test time: 86 min\n- Low impurity content including acetone, ethanol and acid substances\n\n### Wide Application Scenarios\n\n1. Organic chemical synthesis intermediate for pharmaceutical, resin and plastic manufacturing\n2. Industrial cleaning solvent for machinery, metal parts and electronic equipment\n3. Diluent for paint, ink, coating and adhesive production\n4. Clean fuel for industrial boilers, heating systems and new energy projects\n5. Raw material for formaldehyde, methyl ester and other derivative chemicals\n\n### Supply Advantages\n\nWe maintain sufficient bulk inventory all year round. Multiple delivery solutions including tank truck and IBC tote can be arranged to match different order volumes. Our professional technical team can offer parameter support according to local industrial standards for global partners. All products undergo strict quality control before shipment to meet international industrial usage requirements.	PRODUCT_SALE	\N	582.00	USD	吨	1	\N	OPEN	cmprziifr000763g8vjb4v75f	email:  aardenx@outlook.com        tel: 8618627407019	0	0	\N	["/uploads/task-attachments/a944ebb8-115d-47d5-bcdb-5562f82e66ea.pdf"]	2026-07-25 06:46:04.234	2026-07-25 06:46:04.234
\.


--
-- Data for Name: Notice; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Notice" (id, title, content, "senderId", priority, "isGlobal", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PaymentProof; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."PaymentProof" (id, "userId", "sellerProfileId", amount, currency, "transactionId", "paymentMethod", "screenshotUrl", notes, status, "adminNotes", "submittedAt", "reviewedAt") FROM stdin;
\.


--
-- Data for Name: PlatformFee; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."PlatformFee" (id, "feeType", amount, currency, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PrivateMessage; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."PrivateMessage" (id, content, "senderId", "receiverId", "isRead", "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Product" (id, "sellerId", "categoryId", title, "titleEn", description, specifications, "minOrderQty", "supplyCapacity", "mainImageUrl", images, videos, documents, "hasBrochure", "viewCount", "inquiryCount", "isActive", "isFeatured", "createdAt", "updatedAt", "boothId", descriptions, titles, "minOrderUnitId", "supplyCapacityUnitId") FROM stdin;
cms7al2js000btdg81wc682dh	cmruibk9q00024ig83uq02u99	cms73hl9d0000ajg8hfr25y2e	聚碳酸酯（PC）薄膜，Polycarbonate (PC) Film，Polycarbonatfolie，ポリカーボネートフィルム，폴리카보네이트 필름，Film en Polycarbonate，Film in Policarbonato，Película de Policarbonato	\N	Product Name: Polycarbonate (PC) Film\nModel No.: PC10\nColor: Transparent\nSurface Texture: Polished / Polished\nThickness: 0.25 mm\nWidth: 1230 mm\nLength: 2000 m (customized)\nTotal Square: 2460 m²\nRolls: 4 rolls\nVolume: 0.615 m³\nGross Weight: 960 KG\nPackaging: Kraft Paper\nTrade Terms: CIF Incheon Port\nSettlement Currency: USD\nUnit Price: 2.6 USD/m²\nTotal Amount: 6396 USD\nDelivery Cycle: 30 Days\nMinimum Order Quantity: 2000 m\nQuotation Validity: 2026-07-22\n\nPhysical Properties:\n\n    Light Transmission: 89% (ASTM D1003)\n\n    Haze: <0.5% (ASTM D1003)\n\n    Density: 1.2 g/cm³ (ISO 1183)\n\n    Water Absorbing Capacity: <0.3% (ASTM D570)\n\n    Tensile Strength: 60 MPa (ISO 527)\n\n    Elongation: >100% (ISO 527)\n\n    Tensile Modulus: 2300 MPa (ISO 178)\n\n    Flexural Strength: 91 MPa (ISO 178)\n\n    Dielectric Constant: 3 (IEC 60250)\n\n    Resistant Puncture Voltage: 30 KV/mm (IEC 60243)\n\n    Arc Resistivity: 250 (IEC 60112)\n\n    Surface Resistivity: 1.00E+16 Ω/square (IEC 60093)\n\n    Volume Resistivity: 1.00E+17 Ω·cm (IEC 60093)\n\n    Coefficient of Thermal Expansion: 58 PPM/°C (ISO 11359)\n\n    Thermal Conductivity: 0.2 W/(m·K) (ASTM D5470)\n\n    Thermal Shrinkage (150°C): 0.2~0.5% (ASTM D1204)\n\n    Glass Transition Temperature (Tg): 152°C (ISO 306)\n\n    Flammability: UL94 V-2/VTM-2 (E249605)\n\nCompliance:\n\n    RoHS 2.0: Pass (EU 2015/863 & 2017/2102)\n\n    PAHs: Pass, compliant with AfPS GS-2019-01:PAK Category 2b (all 15 items N.D.)\n\nApplications:\nNameplates, signs, automotive instrument panels, toy car shells, helmets, wide-angle mirrors, electronic panels, industrial protective covers\n\nPackaging & Shipping:\n\n    Packaging: Kraft Paper\n\n    Shipping: By Sea (CIF Incheon Port)\n\n    Delivery: 30 Days (for customized orders)	{}	100	10000	/uploads/products/46a6ef35-3ee8-4a8c-87ab-a8ed0b8f6cca.webp	{/uploads/products/46a6ef35-3ee8-4a8c-87ab-a8ed0b8f6cca.webp,/uploads/products/2cff8e9b-e181-485e-ac9c-638d40a4f980.webp}	{}	null	f	5	0	t	f	2026-07-30 09:09:17.992	2026-08-01 03:01:06.382	cms7a86hb000atdg8ip99787w	{"en": "Product Name: Polycarbonate (PC) Film\\nModel No.: PC10\\nColor: Transparent\\nSurface Texture: Polished / Polished\\nThickness: 0.25 mm\\nWidth: 1230 mm\\nLength: 2000 m (customized)\\nTotal Square: 2460 m²\\nRolls: 4 rolls\\nVolume: 0.615 m³\\nGross Weight: 960 KG\\nPackaging: Kraft Paper\\nTrade Terms: CIF Incheon Port\\nSettlement Currency: USD\\nUnit Price: 2.6 USD/m²\\nTotal Amount: 6396 USD\\nDelivery Cycle: 30 Days\\nMinimum Order Quantity: 2000 m\\nQuotation Validity: 2026-07-22\\n\\nPhysical Properties:\\n\\n    Light Transmission: 89% (ASTM D1003)\\n\\n    Haze: <0.5% (ASTM D1003)\\n\\n    Density: 1.2 g/cm³ (ISO 1183)\\n\\n    Water Absorbing Capacity: <0.3% (ASTM D570)\\n\\n    Tensile Strength: 60 MPa (ISO 527)\\n\\n    Elongation: >100% (ISO 527)\\n\\n    Tensile Modulus: 2300 MPa (ISO 178)\\n\\n    Flexural Strength: 91 MPa (ISO 178)\\n\\n    Dielectric Constant: 3 (IEC 60250)\\n\\n    Resistant Puncture Voltage: 30 KV/mm (IEC 60243)\\n\\n    Arc Resistivity: 250 (IEC 60112)\\n\\n    Surface Resistivity: 1.00E+16 Ω/square (IEC 60093)\\n\\n    Volume Resistivity: 1.00E+17 Ω·cm (IEC 60093)\\n\\n    Coefficient of Thermal Expansion: 58 PPM/°C (ISO 11359)\\n\\n    Thermal Conductivity: 0.2 W/(m·K) (ASTM D5470)\\n\\n    Thermal Shrinkage (150°C): 0.2~0.5% (ASTM D1204)\\n\\n    Glass Transition Temperature (Tg): 152°C (ISO 306)\\n\\n    Flammability: UL94 V-2/VTM-2 (E249605)\\n\\nCompliance:\\n\\n    RoHS 2.0: Pass (EU 2015/863 & 2017/2102)\\n\\n    PAHs: Pass, compliant with AfPS GS-2019-01:PAK Category 2b (all 15 items N.D.)\\n\\nApplications:\\nNameplates, signs, automotive instrument panels, toy car shells, helmets, wide-angle mirrors, electronic panels, industrial protective covers\\n\\nPackaging & Shipping:\\n\\n    Packaging: Kraft Paper\\n\\n    Shipping: By Sea (CIF Incheon Port)\\n\\n    Delivery: 30 Days (for customized orders)"}	{"en": "聚碳酸酯（PC）薄膜，Polycarbonate (PC) Film，Polycarbonatfolie，ポリカーボネートフィルム，폴리카보네이트 필름，Film en Polycarbonate，Film in Policarbonato，Película de Policarbonato"}	\N	\N
cmrzweigr000lo0g8p30o57jk	cmruibk9q00024ig83uq02u99	cmrzrang0000ho0g8s3agld6z	Oil-immersed Distribution Transformer,Máy biến áp phân phối ngâm dầu, máy biến áp hợp kim phi tinh thể,Transformator distribusi terendam minyak, transformator paduan amorf,หม้อแปลงจ่ายไฟจุ่มน้ำมัน หม้อแปลงโลหะผสมอามอร์ฟัส	\N	Full-range silicon steel and amorphous alloy products with low loss, low noise, excellent short-circuit withstand capability and high overload resistance. Suitable for urban and rural power grids, industrial plants, commercial buildings and data centers.\n	{}	\N	\N	/uploads/products/7a542bb9-ef9f-457e-b797-6b4424c655c1.webp	{/uploads/products/7a542bb9-ef9f-457e-b797-6b4424c655c1.webp,/uploads/products/4146b41c-e90e-4f14-abe2-768c75ea5fd4.webp}	{}	null	f	25	0	t	f	2026-07-25 04:57:54.171	2026-08-01 03:30:26.902	cmrztompm000io0g8a4bftrmx	{"en": "Full-range silicon steel and amorphous alloy products with low loss, low noise, excellent short-circuit withstand capability and high overload resistance. Suitable for urban and rural power grids, industrial plants, commercial buildings and data centers.\\n"}	{"en": "Oil-immersed Distribution Transformer,Máy biến áp phân phối ngâm dầu, máy biến áp hợp kim phi tinh thể,Transformator distribusi terendam minyak, transformator paduan amorf,หม้อแปลงจ่ายไฟจุ่มน้ำมัน หม้อแปลงโลหะผสมอามอร์ฟัส"}	\N	\N
cmrxjvtio0008o0g82saqynas	cmruibk9q00024ig83uq02u99	cmrxj31t60005o0g8yjykmjxs	Circular Column Steel Formwork，Encofrado de Acero para Columnas Circulares，Coffrage Acier pour Colonnes Circulaires，قوالب فولاذية للأعمدة الدائرية，Стальная круглая опалубка для колонн，Fôrma de Aço para Colunas Circulares，Stahl-Rundstützenschalung，円形鋼製型枠（えんけいこうせいかたわく），원형 강재 거푸집，Cassero in Acciaio per Colonne Circolari	\N	    Seamless Precision – Tight joints (≤ 1 mm) and minimal misalignment (≤ 0.5 mm) ensure exceptional forming accuracy of ± 2 mm, delivering flawless, blemish‑free column surfaces.\n\n    Modular Design – Allows single‑person installation, drastically reducing labor costs and boosting construction efficiency by 40%.\n\n    High Load‑Bearing & Durable – Robust construction withstands heavy concrete pressure; designed for over 50 reuses under normal conditions.\n\n    Low Maintenance – Annual maintenance costs are reduced by up to 60% thanks to high‑quality materials and wear‑resistant surfaces.\n\nLogistics & After‑Sales Support\n\n    Massive Inventory – Over 1,000 tonnes of circular formwork kept in stock to meet urgent project needs.\n\n    Express Delivery – Available for shipment within 48 hours to destinations worldwide.\n\n    Full‑Chain Service – End‑to‑end support, including technical consultation, on‑site installation guidance, and training, ensuring smooth project execution.\n\nWhy Choose Zhongtai Circular Column Formwork?\n\n    Aesthetic Excellence – Produces perfectly round, smooth columns ideal for exposed concrete applications.\n\n    Cost‑Effective – High reuse rate and low maintenance lower overall project costs.\n\n    Time‑Saving – Quick assembly and stripping shorten construction schedules.\n\n    Versatile – Suitable for a wide range of diameters and heights, adaptable to municipal, landscape, and architectural projects.\n\n    Trusted Quality – Manufactured under ISO 9001 certified processes, backed by our “Seiko Quality, Diamond Service” commitment.\n\nFor custom sizes, technical drawings, or bulk orders, please contact our sales team. We are ready to provide tailored solutions for your next infrastructure project.\n\nZhongtai Heavy Industry – Your One‑Stop Road & Bridge Equipment Supply Base.	{}	1	10000	/uploads/products/201627b0-b24a-4ef4-9278-00e9aab05fe6.webp	{/uploads/products/201627b0-b24a-4ef4-9278-00e9aab05fe6.webp}	{}	null	f	33	0	t	f	2026-07-23 13:31:54.288	2026-07-30 08:59:50.605	cmrxhgc6z00002gg84s2iar8a	{"en": "    Seamless Precision – Tight joints (≤ 1 mm) and minimal misalignment (≤ 0.5 mm) ensure exceptional forming accuracy of ± 2 mm, delivering flawless, blemish‑free column surfaces.\\n\\n    Modular Design – Allows single‑person installation, drastically reducing labor costs and boosting construction efficiency by 40%.\\n\\n    High Load‑Bearing & Durable – Robust construction withstands heavy concrete pressure; designed for over 50 reuses under normal conditions.\\n\\n    Low Maintenance – Annual maintenance costs are reduced by up to 60% thanks to high‑quality materials and wear‑resistant surfaces.\\n\\nLogistics & After‑Sales Support\\n\\n    Massive Inventory – Over 1,000 tonnes of circular formwork kept in stock to meet urgent project needs.\\n\\n    Express Delivery – Available for shipment within 48 hours to destinations worldwide.\\n\\n    Full‑Chain Service – End‑to‑end support, including technical consultation, on‑site installation guidance, and training, ensuring smooth project execution.\\n\\nWhy Choose Zhongtai Circular Column Formwork?\\n\\n    Aesthetic Excellence – Produces perfectly round, smooth columns ideal for exposed concrete applications.\\n\\n    Cost‑Effective – High reuse rate and low maintenance lower overall project costs.\\n\\n    Time‑Saving – Quick assembly and stripping shorten construction schedules.\\n\\n    Versatile – Suitable for a wide range of diameters and heights, adaptable to municipal, landscape, and architectural projects.\\n\\n    Trusted Quality – Manufactured under ISO 9001 certified processes, backed by our “Seiko Quality, Diamond Service” commitment.\\n\\nFor custom sizes, technical drawings, or bulk orders, please contact our sales team. We are ready to provide tailored solutions for your next infrastructure project.\\n\\nZhongtai Heavy Industry – Your One‑Stop Road & Bridge Equipment Supply Base."}	{"en": "Circular Column Steel Formwork，Encofrado de Acero para Columnas Circulares，Coffrage Acier pour Colonnes Circulaires，قوالب فولاذية للأعمدة الدائرية，Стальная круглая опалубка для колонн，Fôrma de Aço para Colunas Circulares，Stahl-Rundstützenschalung，円形鋼製型枠（えんけいこうせいかたわく），원형 강재 거푸집，Cassero in Acciaio per Colonne Circolari"}	\N	\N
cmrxi9y8c0003o0g8cxl7f7d0	cmruibk9q00024ig83uq02u99	cmrxi2r9f0002o0g8hctxhb3g	Flat Steel Formwork	\N	Flat Steel Formwork – Series Overview\n\nZhongtai Heavy Industry presents our flagship Flat Steel Formwork series – the industry’s preferred solution for concrete forming in bridge, building, and municipal engineering. With over 2,000 projects served, this range is trusted by major contractors for its precision, durability, and construction efficiency.\nKey Specifications\nParameter\tDetails\nStandard Sizes (Width × Length)\t100×1500mm, 200×1500mm, 300×1500mm, 400×1500mm, 500×1500mm, 600×1500mm, 1000×1500mm, 1200×1500mm\nPanel Thickness\t3mm or 5mm (optional)\nFlatness Tolerance\t≤ 2mm per 2m\nVerticality Tolerance\t≤ 2mm per meter\nJoint Gap\tTightly controlled to prevent leakage\nPerformance Advantages\n\n    High Precision Processing – Smooth surface, tight joints, and consistent dimensions ensure superior concrete finish.\n\n    Quick Assembly & Stripping – Single panel installation takes ≤ 2 minutes, and stripping ≤ 1 minute, significantly speeding up cycle times.\n\n    Exceptional Durability – Designed for > 60 reuses under normal working conditions, reducing formwork procurement costs by up to 40%.\n\n    Proven Reliability – Successfully deployed in over 2,000 projects across bridges, buildings, and municipal infrastructure.\n\nLogistics & After‑Sales Support\n\n    Express Delivery – Standard models are shipped within 12 hours from order confirmation.\n\n    Massive Inventory – Over 1,000 tonnes of flat formwork kept in stock to meet urgent demands.\n\n    Full‑Chain Service – End‑to‑end after‑sales support, from technical consultation to on‑site guidance, ensuring smooth project execution.\n\nWhy Choose Zhongtai Flat Formwork?\n\n    Cost‑Effective – High reuse rate lowers total project cost.\n\n    Time‑Saving – Quick installation and stripping shorten construction schedules.\n\n    Versatile – Suitable for bridge piers, building columns, retaining walls, and various cast‑in‑place concrete structures.\n\n    Trusted Quality – Manufactured with ISO 9001 certified processes and backed by our “Seiko Quality, Diamond Service” commitment.\n\nFor bulk orders, custom sizes, or technical inquiries, please contact our sales team. We are ready to provide tailored solutions for your next infrastructure project.\n\nZhongtai Heavy Industry – Your One‑Stop Road & Bridge Equipment Supply Base.	{}	1	10000	/uploads/products/c1bfc50f-5f54-43cb-afed-0c2004a3e177.webp	{/uploads/products/c1bfc50f-5f54-43cb-afed-0c2004a3e177.webp,/uploads/products/ba6faf55-86b2-48e1-b35f-2ef35cf53a1e.webp}	{}	null	f	30	0	t	f	2026-07-23 12:46:54.348	2026-07-31 14:06:43.678	cmrxhgc6z00002gg84s2iar8a	{"en": "Flat Steel Formwork – Series Overview\\n\\nZhongtai Heavy Industry presents our flagship Flat Steel Formwork series – the industry’s preferred solution for concrete forming in bridge, building, and municipal engineering. With over 2,000 projects served, this range is trusted by major contractors for its precision, durability, and construction efficiency.\\nKey Specifications\\nParameter\\tDetails\\nStandard Sizes (Width × Length)\\t100×1500mm, 200×1500mm, 300×1500mm, 400×1500mm, 500×1500mm, 600×1500mm, 1000×1500mm, 1200×1500mm\\nPanel Thickness\\t3mm or 5mm (optional)\\nFlatness Tolerance\\t≤ 2mm per 2m\\nVerticality Tolerance\\t≤ 2mm per meter\\nJoint Gap\\tTightly controlled to prevent leakage\\nPerformance Advantages\\n\\n    High Precision Processing – Smooth surface, tight joints, and consistent dimensions ensure superior concrete finish.\\n\\n    Quick Assembly & Stripping – Single panel installation takes ≤ 2 minutes, and stripping ≤ 1 minute, significantly speeding up cycle times.\\n\\n    Exceptional Durability – Designed for > 60 reuses under normal working conditions, reducing formwork procurement costs by up to 40%.\\n\\n    Proven Reliability – Successfully deployed in over 2,000 projects across bridges, buildings, and municipal infrastructure.\\n\\nLogistics & After‑Sales Support\\n\\n    Express Delivery – Standard models are shipped within 12 hours from order confirmation.\\n\\n    Massive Inventory – Over 1,000 tonnes of flat formwork kept in stock to meet urgent demands.\\n\\n    Full‑Chain Service – End‑to‑end after‑sales support, from technical consultation to on‑site guidance, ensuring smooth project execution.\\n\\nWhy Choose Zhongtai Flat Formwork?\\n\\n    Cost‑Effective – High reuse rate lowers total project cost.\\n\\n    Time‑Saving – Quick installation and stripping shorten construction schedules.\\n\\n    Versatile – Suitable for bridge piers, building columns, retaining walls, and various cast‑in‑place concrete structures.\\n\\n    Trusted Quality – Manufactured with ISO 9001 certified processes and backed by our “Seiko Quality, Diamond Service” commitment.\\n\\nFor bulk orders, custom sizes, or technical inquiries, please contact our sales team. We are ready to provide tailored solutions for your next infrastructure project.\\n\\nZhongtai Heavy Industry – Your One‑Stop Road & Bridge Equipment Supply Base."}	{"en": "Flat Steel Formwork"}	\N	\N
cmrxj9n4f0006o0g82vwjhxhq	cmruibk9q00024ig83uq02u99	cmrxj31t60005o0g8yjykmjxs	Pile Cap Formwork	\N	Pile Cap Steel Formwork – Series Overview\n\nZhongtai Heavy Industry presents our high-performance Pile Cap Steel Formwork – a specialized solution designed for casting foundation pile caps in bridges, high-rise buildings, and other major infrastructure projects. Engineered with high-strength structures and precision joint technology, this formwork system effectively resists the lateral pressure of mass concrete pours, ensuring superior casting quality and structural integrity.\nKey Specifications\nParameter\tDetails\nStandard Sizes (Width × Length)\t3000×2000mm, 3000×1000mm, 3000×500mm\nCustomization\tAvailable upon request with technical drawings\nJoint Gap\t≤ 1mm\nMisalignment Tolerance\t≤ 0.5mm\nConcrete Forming Accuracy\t± 2mm\nPerformance Advantages\n\n    Precision Engineering – Tight joint gaps (≤ 1mm) and minimal misalignment (≤ 0.5mm) deliver concrete forming accuracy of ± 2mm, ensuring flawless pile cap surfaces.\n\n    Modular Design – Allows single-person installation, significantly reducing labor costs and improving construction efficiency by 40%.\n\n    High Load-Bearing Capacity – Robust structure withstands the immense lateral pressure of mass concrete pours, guaranteeing safety and stability on site.\n\n    Exceptional Durability – Designed for > 50 reuses under normal working conditions, with annual maintenance costs reduced by up to 60%.\n\nLogistics & After‑Sales Support\n\n    Massive Inventory – Over 1,000 tonnes of pile cap formwork kept in stock to meet urgent project demands.\n\n    Express Delivery – Available for nationwide shipment within 48 hours.\n\n    Full‑Chain Service – End‑to‑end after‑sales support, including technical consultation, on‑site installation guidance, and maintenance training.\n\nWhy Choose Zhongtai Pile Cap Formwork?\n\n    Cost‑Effective – High reuse rate and low maintenance reduce total project cost.\n\n    Time‑Saving – Modular design and quick assembly shorten construction schedules.\n\n    Versatile – Suitable for bridge foundations, high‑rise building pile caps, and various mass concrete structures.\n\n    Trusted Quality – Manufactured with ISO 9001 certified processes and backed by our "Seiko Quality, Diamond Service" commitment.\n\nFor bulk orders, custom sizes, or technical inquiries, please contact our sales team. We are ready to provide tailored solutions for your next infrastructure project.\n\nZhongtai Heavy Industry – Your One‑Stop Road & Bridge Equipment Supply Base.	{}	1	10000	/uploads/products/84124d62-bf32-43f4-87a3-14892bb4cd4e.webp	{/uploads/products/84124d62-bf32-43f4-87a3-14892bb4cd4e.webp}	{}	null	f	33	0	t	f	2026-07-23 13:14:39.567	2026-07-30 08:59:51.018	cmrxhgc6z00002gg84s2iar8a	{"en": "Pile Cap Steel Formwork – Series Overview\\n\\nZhongtai Heavy Industry presents our high-performance Pile Cap Steel Formwork – a specialized solution designed for casting foundation pile caps in bridges, high-rise buildings, and other major infrastructure projects. Engineered with high-strength structures and precision joint technology, this formwork system effectively resists the lateral pressure of mass concrete pours, ensuring superior casting quality and structural integrity.\\nKey Specifications\\nParameter\\tDetails\\nStandard Sizes (Width × Length)\\t3000×2000mm, 3000×1000mm, 3000×500mm\\nCustomization\\tAvailable upon request with technical drawings\\nJoint Gap\\t≤ 1mm\\nMisalignment Tolerance\\t≤ 0.5mm\\nConcrete Forming Accuracy\\t± 2mm\\nPerformance Advantages\\n\\n    Precision Engineering – Tight joint gaps (≤ 1mm) and minimal misalignment (≤ 0.5mm) deliver concrete forming accuracy of ± 2mm, ensuring flawless pile cap surfaces.\\n\\n    Modular Design – Allows single-person installation, significantly reducing labor costs and improving construction efficiency by 40%.\\n\\n    High Load-Bearing Capacity – Robust structure withstands the immense lateral pressure of mass concrete pours, guaranteeing safety and stability on site.\\n\\n    Exceptional Durability – Designed for > 50 reuses under normal working conditions, with annual maintenance costs reduced by up to 60%.\\n\\nLogistics & After‑Sales Support\\n\\n    Massive Inventory – Over 1,000 tonnes of pile cap formwork kept in stock to meet urgent project demands.\\n\\n    Express Delivery – Available for nationwide shipment within 48 hours.\\n\\n    Full‑Chain Service – End‑to‑end after‑sales support, including technical consultation, on‑site installation guidance, and maintenance training.\\n\\nWhy Choose Zhongtai Pile Cap Formwork?\\n\\n    Cost‑Effective – High reuse rate and low maintenance reduce total project cost.\\n\\n    Time‑Saving – Modular design and quick assembly shorten construction schedules.\\n\\n    Versatile – Suitable for bridge foundations, high‑rise building pile caps, and various mass concrete structures.\\n\\n    Trusted Quality – Manufactured with ISO 9001 certified processes and backed by our \\"Seiko Quality, Diamond Service\\" commitment.\\n\\nFor bulk orders, custom sizes, or technical inquiries, please contact our sales team. We are ready to provide tailored solutions for your next infrastructure project.\\n\\nZhongtai Heavy Industry – Your One‑Stop Road & Bridge Equipment Supply Base."}	{"en": "Pile Cap Formwork"}	\N	\N
cms5p31bc0006cbg8ma54rfal	cmruibk9q00024ig83uq02u99	cms5mskzu0004cbg89jfsvtwq	Desktop Smart Privacy Screen，Pantalla Inteligente de Privacidad para Escritorio，شاشة ذكية خصوصية للمكتب，Écran Intelligent de Confidentialité pour Bureau，Intelligenter Datenschutzbildschirm für Schreibtisch	\N	OEM，ODM	{}	100	10000	/uploads/products/601831a2-ae07-44bb-9a0c-69963452b36f.webp	{/uploads/products/601831a2-ae07-44bb-9a0c-69963452b36f.webp,/uploads/products/64a9f853-45cf-4d3d-93be-05dd68ebd244.webp,/uploads/products/8115b9d1-0fe6-4d4a-b184-923a9f272ec5.webp}	{}	null	f	10	0	t	f	2026-07-29 06:19:38.473	2026-07-31 11:36:47.728	cms5ozv4c0005cbg8oooxzuk6	{"en": "OEM，ODM"}	{"en": "Desktop Smart Privacy Screen，Pantalla Inteligente de Privacidad para Escritorio，شاشة ذكية خصوصية للمكتب，Écran Intelligent de Confidentialité pour Bureau，Intelligenter Datenschutzbildschirm für Schreibtisch"}	\N	\N
cmrzwiyou000mo0g8ampi3asv	cmruibk9q00024ig83uq02u99	cmrzrang0000ho0g8s3agld6z	Dry-type Distribution Transformer (SC (B) Series)，Trockentransformator, Epoxid-Gießtransformator, SCB-Transformator，Kuru tip transformatör, epoksi döküm transformatör, SCB transformatör	\N	环氧树脂浇注干式，防火阻燃、免维护、无污染；分 1/2/3 级能效，用于民用建筑、工厂、数据中心、新能源配网。	{}	1	10000	/uploads/products/530bba05-25f5-4e1c-911e-35b30cb65ab6.webp	{/uploads/products/530bba05-25f5-4e1c-911e-35b30cb65ab6.webp,/uploads/products/a505cd3f-e6f6-4d62-a9c4-e764e97cc7f7.webp}	{}	null	f	22	0	t	f	2026-07-25 05:01:21.822	2026-07-31 13:18:51.76	cmrztompm000io0g8a4bftrmx	{"en": "环氧树脂浇注干式，防火阻燃、免维护、无污染；分 1/2/3 级能效，用于民用建筑、工厂、数据中心、新能源配网。"}	{"en": "Dry-type Distribution Transformer (SC (B) Series)，Trockentransformator, Epoxid-Gießtransformator, SCB-Transformator，Kuru tip transformatör, epoksi döküm transformatör, SCB transformatör"}	\N	\N
cmrzw8bcl000ko0g8n7vjsttc	cmruibk9q00024ig83uq02u99	cmrzrang0000ho0g8s3agld6z	AC Power Transformer,ransformador de potencia CA, transformador principal de alta tensión,Transformateur de puissance CA, transformateur principal haute tension,محول طاقة تيار متردد، محول رئيسي عالي الجهد	\N	Product Range:\nVoltage up to 1000kV,\ncapacity up to 1.5 million kVA.\nProduct Features:\nHigh reliability, low loss, low noise, low temperature rise, and low\npartial discharge.\nApplication Scenarios:\nVoltage transformation and power transmission in all links of power\nsystems such as power grids, hydropower generation, thermal power\ngeneration, and industrial and mining enterprises.	{}	1	10000	/uploads/products/c57cb716-37b0-4742-9641-2547a763e546.webp	{/uploads/products/c57cb716-37b0-4742-9641-2547a763e546.webp,/uploads/products/14fb9028-8d53-4277-8455-716db885572f.webp}	{}	null	f	27	0	t	f	2026-07-25 04:53:05.014	2026-07-31 11:36:49.439	cmrztompm000io0g8a4bftrmx	{"en": "Product Range:\\nVoltage up to 1000kV,\\ncapacity up to 1.5 million kVA.\\nProduct Features:\\nHigh reliability, low loss, low noise, low temperature rise, and low\\npartial discharge.\\nApplication Scenarios:\\nVoltage transformation and power transmission in all links of power\\nsystems such as power grids, hydropower generation, thermal power\\ngeneration, and industrial and mining enterprises."}	{"en": "AC Power Transformer,ransformador de potencia CA, transformador principal de alta tensión,Transformateur de puissance CA, transformateur principal haute tension,محول طاقة تيار متردد، محول رئيسي عالي الجهد"}	\N	\N
cmrzw31sl000jo0g8892sevyz	cmruibk9q00024ig83uq02u99	cmrzrang0000ho0g8s3agld6z	Converter Transformer (HVDC)，Transformador convertidor HVDC, transformador de corriente continua，Transformateur de conversion HVDC, transformateur courant continu，Transformador conversor HVDC, transformador corrente contínua，Máy biến áp chuyển dòng HVDC, máy biến áp điện một chiều	\N	Core equipment for high-voltage direct current (HVDC) transmission. It can operate under AC-DC mixed operating conditions, featuring strong harmonic withstand capability and high reliability, with high technical barriers and manufacturing costs. It is applied to long-distance large-capacity DC power transmission, interconnection of different-frequency/asynchronous power grids, and grid integration of new energy sources.	{}	1	10000	/uploads/products/a9029a72-c450-4557-b2c1-f29b22619690.webp	{/uploads/products/a9029a72-c450-4557-b2c1-f29b22619690.webp,/uploads/products/7eaa3735-aed4-48a2-a2d5-51d40ecc579b.webp}	{}	null	f	21	0	t	f	2026-07-25 04:48:59.349	2026-07-31 11:40:23.746	cmrztompm000io0g8a4bftrmx	{"en": "Core equipment for high-voltage direct current (HVDC) transmission. It can operate under AC-DC mixed operating conditions, featuring strong harmonic withstand capability and high reliability, with high technical barriers and manufacturing costs. It is applied to long-distance large-capacity DC power transmission, interconnection of different-frequency/asynchronous power grids, and grid integration of new energy sources."}	{"en": "Converter Transformer (HVDC)，Transformador convertidor HVDC, transformador de corriente continua，Transformateur de conversion HVDC, transformateur courant continu，Transformador conversor HVDC, transformador corrente contínua，Máy biến áp chuyển dòng HVDC, máy biến áp điện một chiều"}	\N	\N
cms4kv69c000081g8cthsp6dc	cmruibk9q00024ig83uq02u99	cms4jb29z0002jeg89gr2q7qs	铣削加工刀具，Milling Tools，Fräswerkzeuge / Fräser，Herramientas de fresado ，Фрезерные инструменты，मिलिंग उपकरण (Milling Upkaran) ，Outils de fraisage，밀링 공구，フライス工具，Utensili di fresatura	\N	LNMO02 / LNMO03 Double-Sided High-Feed Insert Series\n\n    Chinese name: 4-Edge Double-Sided High-Feed Milling Insert (LNMO02/LNMO03)\n\n    Description: Features a double‑sided, 4‑edge design for excellent cost‑effectiveness. Suitable for small depths of cut (0.3–0.7 mm) and high feed rates, it effectively improves roughing efficiency. The insert grades include TC3320 and TC5520, and they are applicable to steel, stainless steel, cast iron, titanium alloys, and more.\n\n    Typical models:\n\n        LNMO0202ER‑MM (IC 4.3, thickness 0.9, corner radius 0.5)\n\n        LNMO0303ER‑MJ (IC 6.4, thickness 1.2, corner radius 1.0)\n\n    Corresponding tool holders/cutters: TEHLN02..., TEHLN03..., TFHLN03..., TMHLN02..., TMHLN03...\n\nBLMP04 / BLMP06 Double-Sided High-Feed Insert Series\n\n    Chinese name: 4-Edge Double-Sided High-Feed Milling Insert (BLMP04/BLMP06)\n\n    Description: Specifically designed for mold and general machining applications. The sharp R‑groove geometry ensures light and smooth cutting. Maximum depth of cut: 0.5–1.0 mm; feed per tooth can reach 0.5–3.0 mm.\n\n    Typical models:\n\n        BLMP0402R‑M (IC 6.2, thickness 0.5)\n\n        BLMP0603R‑M (IC 9.3, thickness 0.9)\n\n    Corresponding tool holders/cutters: TEHBL04..., TEHBL06..., TFHBL06..., TMHBL04..., TMHBL06...\n\nLPGT01 / LOGU03 / SOMT10/14 Series\n\n    Chinese name: High‑Feed Milling Inserts (LPGT01/LOGU03/SOMT10/14)\n\n    Description: Covers a variety of geometries – 2‑edge single‑sided (LPGT01), 4‑edge double‑sided (LOGU03), and 4‑edge single‑sided (SOMT) – to suit different machining conditions. The SOMT series features a positive rake angle design for low cutting resistance.\n\n    Typical models:\n\n        LPGT010210‑GM\n\n        LOGU030310‑GM\n\n        SOMT100420‑GM\n\n        SOMT140520‑GM\n\n    Corresponding tool holders/cutters: TEHLP01..., TMHLO03..., TFHLO03..., TEHSO10..., TFHSO10...	{}	1	10000	/uploads/products/009fab63-8895-4241-9a1d-bb01cc3ffeb2.webp	{/uploads/products/009fab63-8895-4241-9a1d-bb01cc3ffeb2.webp,/uploads/products/fd1bc0b6-55e4-4eef-9a0e-ac6d30af37a6.webp,/uploads/products/2984de14-4abc-474d-ae17-0bb7b5421b19.webp,/uploads/products/e054c646-8bea-4e1b-a281-9a2649e5c74a.webp,/uploads/products/fb47c7f2-9e4d-4e7a-a751-7ce7a96d1fb5.webp,/uploads/products/27c28303-4494-4c1d-b490-c891a9a77c9a.webp,/uploads/products/d5f0f3a9-19cf-47ae-b426-0fbf7e7d5318.webp,/uploads/products/3e44ab11-cc25-44ab-b239-4292547bad3b.webp,/uploads/products/8d593b54-8799-4038-af1b-4bc3ec800945.webp}	{}	null	f	17	0	t	f	2026-07-28 11:33:46.993	2026-08-01 04:32:38.367	cms05grmv000to0g8iyzkw58e	{"en": "LNMO02 / LNMO03 Double-Sided High-Feed Insert Series\\n\\n    Chinese name: 4-Edge Double-Sided High-Feed Milling Insert (LNMO02/LNMO03)\\n\\n    Description: Features a double‑sided, 4‑edge design for excellent cost‑effectiveness. Suitable for small depths of cut (0.3–0.7 mm) and high feed rates, it effectively improves roughing efficiency. The insert grades include TC3320 and TC5520, and they are applicable to steel, stainless steel, cast iron, titanium alloys, and more.\\n\\n    Typical models:\\n\\n        LNMO0202ER‑MM (IC 4.3, thickness 0.9, corner radius 0.5)\\n\\n        LNMO0303ER‑MJ (IC 6.4, thickness 1.2, corner radius 1.0)\\n\\n    Corresponding tool holders/cutters: TEHLN02..., TEHLN03..., TFHLN03..., TMHLN02..., TMHLN03...\\n\\nBLMP04 / BLMP06 Double-Sided High-Feed Insert Series\\n\\n    Chinese name: 4-Edge Double-Sided High-Feed Milling Insert (BLMP04/BLMP06)\\n\\n    Description: Specifically designed for mold and general machining applications. The sharp R‑groove geometry ensures light and smooth cutting. Maximum depth of cut: 0.5–1.0 mm; feed per tooth can reach 0.5–3.0 mm.\\n\\n    Typical models:\\n\\n        BLMP0402R‑M (IC 6.2, thickness 0.5)\\n\\n        BLMP0603R‑M (IC 9.3, thickness 0.9)\\n\\n    Corresponding tool holders/cutters: TEHBL04..., TEHBL06..., TFHBL06..., TMHBL04..., TMHBL06...\\n\\nLPGT01 / LOGU03 / SOMT10/14 Series\\n\\n    Chinese name: High‑Feed Milling Inserts (LPGT01/LOGU03/SOMT10/14)\\n\\n    Description: Covers a variety of geometries – 2‑edge single‑sided (LPGT01), 4‑edge double‑sided (LOGU03), and 4‑edge single‑sided (SOMT) – to suit different machining conditions. The SOMT series features a positive rake angle design for low cutting resistance.\\n\\n    Typical models:\\n\\n        LPGT010210‑GM\\n\\n        LOGU030310‑GM\\n\\n        SOMT100420‑GM\\n\\n        SOMT140520‑GM\\n\\n    Corresponding tool holders/cutters: TEHLP01..., TMHLO03..., TFHLO03..., TEHSO10..., TFHSO10..."}	{"en": "铣削加工刀具，Milling Tools，Fräswerkzeuge / Fräser，Herramientas de fresado ，Фрезерные инструменты，मिलिंग उपकरण (Milling Upkaran) ，Outils de fraisage，밀링 공구，フライス工具，Utensili di fresatura"}	\N	\N
cms09dndq001fo0g86hv165je	cmruibk9q00024ig83uq02u99	cms08py7b000zo0g8wnuibel3	HRB Deep Groove Ball Bearings - 6000 Series，HRB 深沟球轴承 - 6000 系列，HRB Rillenkugellager - 6000 Serie，HRB 深溝玉軸受 - 6000シリーズ （HRB しんこうたまじくうけ - 6000 shirīzu），HRB Roulements à billes à gorge profonde - Série 6000，HRB 딥 그루브 볼 베어링 - 6000 시리즈 （HRB dip geurubeu bol beeoring - 6000 sirijeu），HRB Diepgroefkogellagers - 6000 Serie，HRB Cuscinetti a sfere con gola profonda - Serie 6000，HRB Rodamientos de bolas de ranura profunda - Serie 6000，HRB Rolamentos de esferas de sulco profundo - Série 6000	\N	HRB Deep Groove Ball Bearings – 6000 Series\n\nHRB deep groove ball bearings are the most widely used type of rolling bearings in the machinery industry. They are designed to primarily support radial loads while also accommodating a certain amount of axial loads in either direction. With a low friction torque and high limiting speed, these bearings offer excellent performance in a wide range of applications.\n\nThe 6000 series bearings are available in multiple variant structures including Z, 2Z, RZ, 2RZ, RS1, 2RS1, N, NR, ZN, and RZN, allowing customers to select the ideal configuration for their specific operating conditions. The open type (without seals or shields) offers the lowest friction and is suitable for high-speed applications, while the metal shields (Z, 2Z) provide effective dust protection. The rubber seals (RS1, 2RS1) are recommended for environments requiring grease retention and enhanced contamination protection, and the snap ring grooves (N, NR) enable secure axial location within the housing.\n\nManufactured by Harbin Bearing Manufacturing Co., Ltd. – one of China's top three bearing production bases since 1950 – these bearings are produced in a state-of-the-art facility with ISO 9001, TS16949, and AS9100 certifications. With a bore diameter range from 10 mm to 1400 mm and annual production capacity exceeding 80 million pieces, HRB ensures consistent quality and reliable performance for applications in precision instruments, low-noise motors, automobiles, motorcycles, and general industrial machinery.	{}	1	10000	/uploads/products/10952d3e-dfff-4721-85ef-bd9a72111a8f.webp	{/uploads/products/10952d3e-dfff-4721-85ef-bd9a72111a8f.webp,/uploads/products/24a0fc2e-1d67-4f9f-9ff1-7ab3ce69e60f.webp,/uploads/products/81c35b76-f1ed-41cf-9d2f-c793d9a96cde.webp,/uploads/products/cdc47902-85a2-49be-a7d5-19b4f49701a7.webp,/uploads/products/5788942b-c5f5-4d50-9110-757e268a8a2c.webp}	{}	null	f	25	0	t	f	2026-07-25 11:01:08.894	2026-08-01 02:59:55.335	cms08caad000uo0g80xmoa5p0	{"en": "HRB Deep Groove Ball Bearings – 6000 Series\\n\\nHRB deep groove ball bearings are the most widely used type of rolling bearings in the machinery industry. They are designed to primarily support radial loads while also accommodating a certain amount of axial loads in either direction. With a low friction torque and high limiting speed, these bearings offer excellent performance in a wide range of applications.\\n\\nThe 6000 series bearings are available in multiple variant structures including Z, 2Z, RZ, 2RZ, RS1, 2RS1, N, NR, ZN, and RZN, allowing customers to select the ideal configuration for their specific operating conditions. The open type (without seals or shields) offers the lowest friction and is suitable for high-speed applications, while the metal shields (Z, 2Z) provide effective dust protection. The rubber seals (RS1, 2RS1) are recommended for environments requiring grease retention and enhanced contamination protection, and the snap ring grooves (N, NR) enable secure axial location within the housing.\\n\\nManufactured by Harbin Bearing Manufacturing Co., Ltd. – one of China's top three bearing production bases since 1950 – these bearings are produced in a state-of-the-art facility with ISO 9001, TS16949, and AS9100 certifications. With a bore diameter range from 10 mm to 1400 mm and annual production capacity exceeding 80 million pieces, HRB ensures consistent quality and reliable performance for applications in precision instruments, low-noise motors, automobiles, motorcycles, and general industrial machinery."}	{"en": "HRB Deep Groove Ball Bearings - 6000 Series，HRB 深沟球轴承 - 6000 系列，HRB Rillenkugellager - 6000 Serie，HRB 深溝玉軸受 - 6000シリーズ （HRB しんこうたまじくうけ - 6000 shirīzu），HRB Roulements à billes à gorge profonde - Série 6000，HRB 딥 그루브 볼 베어링 - 6000 시리즈 （HRB dip geurubeu bol beeoring - 6000 sirijeu），HRB Diepgroefkogellagers - 6000 Serie，HRB Cuscinetti a sfere con gola profonda - Serie 6000，HRB Rodamientos de bolas de ranura profunda - Serie 6000，HRB Rolamentos de esferas de sulco profundo - Série 6000"}	\N	\N
cms5i1vvr000cwfg8paul2g45	cmruibk9q00024ig83uq02u99	cms4oz305000awfg8uh6yj68t	办公桌嵌入式电源插座，\tDesk Recessed Power Outlet，\tEnchufe de escritorio empotrado，Versenkte Schreibtisch-Steckdose，Prise de courant encastrée pour bureau	\N	OEM，ODM	{}	1	10000	/uploads/products/bf8eb2c7-92a0-49fa-8afa-ba1763568d9b.webp	{/uploads/products/bf8eb2c7-92a0-49fa-8afa-ba1763568d9b.webp,/uploads/products/fb94305c-ec4b-4206-8736-d483908bcf29.webp,/uploads/products/729de8ee-ad94-4cca-a140-3b219a074038.webp,/uploads/products/288cc360-1074-4271-86e7-75d7c57af516.webp,/uploads/products/1fca3322-c07e-4198-a9b3-76c534197c74.webp}	{}	null	f	11	0	t	f	2026-07-29 03:02:47.463	2026-08-01 01:37:51.284	cms4pa6yy000bwfg8iwlllvui	{"en": "OEM，ODM"}	{"en": "办公桌嵌入式电源插座，\\tDesk Recessed Power Outlet，\\tEnchufe de escritorio empotrado，Versenkte Schreibtisch-Steckdose，Prise de courant encastrée pour bureau"}	\N	\N
cms4nxboi0006wfg8fh4vtj3h	cmruibk9q00024ig83uq02u99	cms4nq1rb0005wfg8iu4i71fj	柜式七氟丙烷气体灭火装置（单瓶组），Cabinet-Type Heptafluoropropane Gas Fire Extinguishing Device (Single Cylinder Bank)，	\N	Product Overview\nThe Cabinet-Type Heptafluoropropane Gas Fire Extinguishing Device (Single Cylinder Bank) is a pre-engineered fire suppression system manufactured by Jiangxi Jianhao Fire Protection Equipment Co., Ltd. Heptafluoropropane (HFC‑227ea) is a colorless, odorless, electrically non‑conductive gas with zero ozone depletion potential and no secondary pollution. When a fire occurs, heat and smoke detectors send signals to the fire alarm control panel; after logic analysis, the panel issues audible/visual alarms, closes interlocked equipment, and after a preset delay, activates the solenoid actuator to open the container valve and discharge the agent. A manual emergency button is also provided for mechanical manual operation in critical situations.\n\nKey Features\n\n    Complete product range with aesthetic appearance.\n\n    Direct installation in the protected area – no dedicated cylinder storage room needed.\n\n    Simple construction and installation with low project investment.\n\nApplication Scope\nComputer rooms, telecommunications centers, electrical rooms, transformer rooms, archives, record rooms, valuable item storage, oil storage rooms, and other small‑space protected areas.\n\nTechnical Parameters (text format)\n\n    Model GQQ40/2.5‑JH: Cylinder volume 40 L; Dimensions 500×450×1200 mm; Storage pressure (20°C) 2.5 MPa; Max working pressure (50°C) 4.2 MPa; Start voltage/current DC24V/1.5A; Working temperature range 0°C～50°C.\n\n    Model GQQ70/2.5‑JH: Cylinder volume 70 L; Dimensions 500×450×1400 mm; other parameters same as above.\n\n    Model GQQ90/2.5‑JH: Cylinder volume 90 L; Dimensions 500×450×1600 mm.\n\n    Model GQQ100/2.5‑JH: Cylinder volume 100 L; Dimensions 500×450×1700 mm.\n\n    Model GQQ120/2.5‑JH: Cylinder volume 120 L; Dimensions 500×450×1900 mm.\n\n    Model GQQ150/2.5‑JH: Cylinder volume 150 L; Dimensions 550×500×1900 mm.\n\n    Model GQQ180/2.5‑JH: Cylinder volume 180 L; Dimensions 580×500×2150 mm.\n    All models share: Storage pressure 2.5 MPa, max working pressure 4.2 MPa, start voltage DC24V/1.5A, working temp 0‑50°C.	{}	1	10000	/uploads/products/e8e1ad5f-a35b-4ba8-adca-2c7c6341ea3b.webp	{/uploads/products/e8e1ad5f-a35b-4ba8-adca-2c7c6341ea3b.webp,/uploads/products/2155322f-de9a-413f-8916-7bd9d372c25f.webp,/uploads/products/7177351b-4dd6-40b9-893d-804c5546123d.webp}	{}	null	f	19	0	t	f	2026-07-28 12:59:26.178	2026-08-01 03:22:20.688	cms4nc65v0000wfg8gn40qd7s	{"en": "Product Overview\\nThe Cabinet-Type Heptafluoropropane Gas Fire Extinguishing Device (Single Cylinder Bank) is a pre-engineered fire suppression system manufactured by Jiangxi Jianhao Fire Protection Equipment Co., Ltd. Heptafluoropropane (HFC‑227ea) is a colorless, odorless, electrically non‑conductive gas with zero ozone depletion potential and no secondary pollution. When a fire occurs, heat and smoke detectors send signals to the fire alarm control panel; after logic analysis, the panel issues audible/visual alarms, closes interlocked equipment, and after a preset delay, activates the solenoid actuator to open the container valve and discharge the agent. A manual emergency button is also provided for mechanical manual operation in critical situations.\\n\\nKey Features\\n\\n    Complete product range with aesthetic appearance.\\n\\n    Direct installation in the protected area – no dedicated cylinder storage room needed.\\n\\n    Simple construction and installation with low project investment.\\n\\nApplication Scope\\nComputer rooms, telecommunications centers, electrical rooms, transformer rooms, archives, record rooms, valuable item storage, oil storage rooms, and other small‑space protected areas.\\n\\nTechnical Parameters (text format)\\n\\n    Model GQQ40/2.5‑JH: Cylinder volume 40 L; Dimensions 500×450×1200 mm; Storage pressure (20°C) 2.5 MPa; Max working pressure (50°C) 4.2 MPa; Start voltage/current DC24V/1.5A; Working temperature range 0°C～50°C.\\n\\n    Model GQQ70/2.5‑JH: Cylinder volume 70 L; Dimensions 500×450×1400 mm; other parameters same as above.\\n\\n    Model GQQ90/2.5‑JH: Cylinder volume 90 L; Dimensions 500×450×1600 mm.\\n\\n    Model GQQ100/2.5‑JH: Cylinder volume 100 L; Dimensions 500×450×1700 mm.\\n\\n    Model GQQ120/2.5‑JH: Cylinder volume 120 L; Dimensions 500×450×1900 mm.\\n\\n    Model GQQ150/2.5‑JH: Cylinder volume 150 L; Dimensions 550×500×1900 mm.\\n\\n    Model GQQ180/2.5‑JH: Cylinder volume 180 L; Dimensions 580×500×2150 mm.\\n    All models share: Storage pressure 2.5 MPa, max working pressure 4.2 MPa, start voltage DC24V/1.5A, working temp 0‑50°C."}	{"en": "柜式七氟丙烷气体灭火装置（单瓶组），Cabinet-Type Heptafluoropropane Gas Fire Extinguishing Device (Single Cylinder Bank)，"}	\N	\N
cmrvnjs8l00013yg8k4y2jahz	cmruibk9q00024ig83uq02u99	cmrunjn3z0004u5g8lswspswy	Purchase A00 aluminum ingot/A00铝锭/A00アルミニウム地金/A00 알루미늄 잉곳 구매/Kauf von A00-Aluminiumbarren/Compra de lingotes de aluminio A00	\N	我是居间商，不是工厂。我有多个工厂渠道可以供货；价格根据采购量阶梯下浮；居间费可协商。\nI am a broker, not a manufacturer. I have access to multiple mill sources to supply material. The price will be discounted based on the order volume. My brokerage fee is negotiable.\n私は仲介業者であり、工場ではありません。複数の工場ルートから仕入れが可能です。価格はご注文数量に応じて値引きいたします。仲介手数料は要相談です。\n저는 중개상이며, 공장이 아닙니다. 여러 공급처를 통해 제품을 공급할 수 있습니다. 가격은 주문 수량에 따라 할인됩니다. 중개 수수료는 협의 가능합니다.\n	{}	1	100万吨	/uploads/products/9928cc20-6868-4adb-8ee2-df451c62769a.webp	{/uploads/products/9928cc20-6868-4adb-8ee2-df451c62769a.webp,/uploads/products/b3907bc6-5498-4941-adf1-418e6ec7d78e.webp,/uploads/products/0fd44d09-9b80-4b87-8bf3-48f8c14de843.webp}	{}	null	f	41	0	t	f	2026-07-22 05:38:58.869	2026-07-30 23:15:19.757	cmrvjgce300003yg8rxsyljbs	{"en": "我是居间商，不是工厂。我有多个工厂渠道可以供货；价格根据采购量阶梯下浮；居间费可协商。\\nI am a broker, not a manufacturer. I have access to multiple mill sources to supply material. The price will be discounted based on the order volume. My brokerage fee is negotiable.\\n私は仲介業者であり、工場ではありません。複数の工場ルートから仕入れが可能です。価格はご注文数量に応じて値引きいたします。仲介手数料は要相談です。\\n저는 중개상이며, 공장이 아닙니다. 여러 공급처를 통해 제품을 공급할 수 있습니다. 가격은 주문 수량에 따라 할인됩니다. 중개 수수료는 협의 가능합니다.\\n"}	{"en": "Purchase A00 aluminum ingot/A00铝锭/A00アルミニウム地金/A00 알루미늄 잉곳 구매/Kauf von A00-Aluminiumbarren/Compra de lingotes de aluminio A00"}	\N	\N
\.


--
-- Data for Name: ProductBrochure; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."ProductBrochure" (id, "productId", "fileUrl", "fileName", "fileSize", "downloadCount", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: PublicMessage; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."PublicMessage" (id, content, "senderId", "linkedSellerId", "isSystemMessage", "isAnnouncement", priority, reactions, "createdAt", "fileName", "fileSize", "fileUrl", "isWorldChat", "messageType", "mimeType") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Review" (id, "productId", "sellerId", "userId", rating, title, content, images, "isVerified", "isActive", "helpfulCount", "replyContent", "repliedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReviewHelpfulVote; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."ReviewHelpfulVote" (id, "reviewId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: SEOConfig; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."SEOConfig" (id, "pagePath", title, "titleEn", description, "descriptionEn", keywords, "keywordsEn", "pageType", "isActive", "createdAt", "updatedAt") FROM stdin;
seo-home-zh	/	X2XHub - 全球B2B贸易平台 | 国际展会 | 产品采购	X2XHub - Global B2B Trade Platform	X2XHub是全球领先的B2B贸易平台，连接全球买家和卖家，提供国际展会、产品采购、供应商对接等一站式贸易服务。	X2XHub is the world leading B2B trade platform connecting global buyers and sellers.	B2B,国际贸易,展会,采购,供应商	B2B, international trade, exhibition, sourcing	STATIC	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-home-en	/en	X2XHub - Global B2B Trade Platform	X2XHub - Global B2B Trade Platform	X2XHub is the world leading B2B trade platform.	X2XHub is the world leading B2B trade platform.	B2B, trade, exhibition, sourcing	B2B, trade, exhibition, sourcing	STATIC	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-home-de	/de	X2XHub - Globaler B2B Handelsportal	X2XHub - Global B2B Trade Platform	X2XHub ist eine weltweit fuhrende B2B Handelsplattform.	X2XHub is the world leading B2B trade platform.	B2B, Handel, Ausstellung, Einkauf	B2B, trade, exhibition, sourcing	STATIC	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-products	/products	产品中心 - X2XHub	Product Center - X2XHub	浏览X2XHub产品中心，发现全球优质供应商的各类产品。	Browse X2XHub Product Center to discover quality products.	产品,批发,供应商,采购	products, wholesale, supplier, sourcing	CATEGORY	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-stores	/stores	供应商店铺 - X2XHub	Supplier Stores - X2XHub	访问X2XHub供应商店铺，了解全球优质供应商的详细信息。	Visit X2XHub supplier stores to learn about global suppliers.	供应商,工厂,制造商	supplier, factory, manufacturer	STORE	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-auction	/auction-screen	拍卖大厅 - X2XHub	Auction Hall - X2XHub	参与X2XHub在线拍卖，发现独特的贸易机会。	Participate in X2XHub online auctions.	拍卖,竞价,采购	auction, bidding, sourcing	STATIC	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-about	/about	关于我们 - X2XHub	About Us - X2XHub	X2XHub致力于连接全球贸易伙伴，提供专业的B2B贸易解决方案。	X2XHub connects global trade partners with professional solutions.	关于我们,B2B,贸易平台	about us, B2B, trade platform	STATIC	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
seo-contact	/contact	联系我们 - X2XHub	Contact Us - X2XHub	联系X2XHub团队，获取专业的贸易服务支持和咨询。	Contact X2XHub team for professional trade support.	联系我们,客服,贸易咨询	contact us, customer service, support	STATIC	t	2026-07-21 12:58:14.718	2026-07-21 12:58:14.718
\.


--
-- Data for Name: SellerProfile; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."SellerProfile" (id, "userId", "companyName", "companyType", country, city, address, phone, email, website, description, "logoUrl", "bannerUrl", certifications, "subscriptionStatus", "subscriptionExpiry", "isVerified", "isActive", "createdAt", "updatedAt", "boothCategories", "boothName", "isCustomizable", "lastPaymentAt", "subscriptionAmount", facebook, instagram, linkedin, telegram, wechat, whatsapp, "booth3DPreview", "boothAccentImage", "boothAnimations", "boothBgImage", "boothColor", "boothFont", "boothLayout", "boothTags", "boothTheme", descriptions, awards, "bankAccount", bilibili, "boothNames", "businessAddress", "businessScope", "chatSystem", "companyPhotos", dingtalk, douyin, "employeeCount", "foundingYear", kuaishou, lark, "legalRepresentative", "mapAddress", "mapLatitude", "mapLongitude", "organizationType", patents, pinterest, "profileReviewNotes", "profileReviewedAt", "profileReviewedBy", "profileStatus", "profileSubmittedAt", qq, reddit, "registeredAddress", "registeredCapital", "registrationNumber", snapchat, "taxNumber", "teamPhotos", tiktok, tumblr, twitter, "wechatVideo", weibo, xiaohongshu, youtube, "contactName") FROM stdin;
cmruibk9q00024ig83uq02u99	cmprziifr000763g8vjb4v75f	Taizhou Huihuan International Trading Co., Ltd.	MANUFACTURER	China	Taizhou	No. 89 Yintai Road, Hongjia Street, Jiaojiang District, Building D, 5F001-8-18	+8618627407019	sardenesy@gmail.com	\N	\N	/uploads/products/a8ead2c5-524e-495d-a418-469d80d6c386.webp	/uploads/products/ab5f91a5-701f-4da1-ae0e-5e481d4feabe.webp	\N	FREE_TRIAL	\N	f	t	2026-07-21 10:24:51.038	2026-07-21 11:59:38.681	{}	\N	t	\N	\N	\N	\N	\N	\N	18627407019	\N	f	\N	f	\N	\N	\N	\N	\N	\N	{"en": "Taizhou Huihuan International Trading Co., Ltd. is a comprehensive sourcing and trading company established in July 2026, based in Taizhou, Zhejiang — one of China‘s most dynamic manufacturing regions. The company carries forward the mission and values of its predecessor, Hangzhou Gouhui International Trading Co., Ltd., which operated successfully for several years prior to this new registration.\\n\\nWe position ourselves as a one-stop procurement partner serving global buyers across ALL industries and product lines. Our core strength lies in our ability to source virtually any product — from furniture, building materials, machinery, and industrial equipment to chemicals, textiles, medical devices, electronics, lighting, hardware, and even food and beverages — provided that all products and services are legal and compliant.\\n\\nOur founder brings over 10 years of hands-on experience in factory procurement, production and material control (PMC), costing, and design across multiple manufacturing sectors. This deep operational background enables us to understand client needs from a production perspective, ensuring reliable quality, competitive pricing, and on-time delivery.\\n\\nWe operate on a flexible service model: we handle supplier sourcing and development, one-stop procurement agency, and overseas market promotion and consignment sales. All contracts and payments are settled directly between clients and suppliers, while we facilitate the entire process — from supplier identification and negotiation to quality control and logistics coordination.\\n\\nWith access to a vast network of certified manufacturers across China‘s major industrial hubs, we offer scalable solutions from small trial orders to large-volume contracts. We are also experienced in meeting international compliance standards for EU, US, and Asian markets, and we are committed to supporting our clients‘ sustainability and regulatory requirements.\\n\\nAt our core, we believe in building long-term, trust-based partnerships. We measure our success by our clients‘ satisfaction and growth.", "zh": "General trading and procurement services, including but not limited to:\\n\\nImport and export agency; wholesale and retail of cosmetics, hardware, toys, kitchenware, footwear, garments, stationery, electronics, daily necessities, chemical products (excluding hazardous chemicals), medical devices (Class I), home furnishings, plastic products, metal products, handicrafts, and art collectibles (excluding ivory products);\\n\\nSales of fire-fighting equipment, coatings (excluding hazardous chemicals), computer hardware and software, building materials, textiles, luggage, sporting goods, photovoltaic equipment, EV charging stations, non-ferrous metal alloys, agricultural and food processing machinery, and general machinery;\\n\\nTechnical services, development, consultation, and transfer; internet sales (excluding restricted items); trade brokerage; software development and sales; import and export of technology and goods;\\n\\nFood business: sales of prepackaged food (limited to prepackaged food only) and online sales of prepackaged food.\\n\\nValue-added services: one-stop procurement agency, supplier sourcing and development, OEM/ODM manufacturing coordination, quality control, and supply chain management."}	{}	\N	\N	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	Full-category trading and procurement services: import/export agency, wholesale and retail of furniture, hardware, building materials, textiles, electronics, medical devices, machinery, chemicals, and prepackaged food. Value-added services: supplier sourcing, OEM/ODM coordination, quality control, and supply chain management — serving global buyers across all industries.	sardenesy@gmail.com	{/uploads/products/d2c5fb61-7e62-471d-887b-d6270f2bfb15.webp,/uploads/products/2d08401e-b7dc-4f74-971b-00c97f2b315f.webp,/uploads/products/ea374864-c05a-4b2f-ba75-ddfee56aa638.webp,/uploads/products/6133e5ac-5ebc-4fc9-a159-dac395e85e37.webp,/uploads/products/cd97e33b-43bf-4fa3-b8f9-b3852dbf0902.webp,/uploads/products/4ac33b7a-bc19-48c3-9ca9-f8dcb1978f8a.webp,/uploads/products/1783d6d0-48f4-43b1-8248-6355be93d42b.webp,/uploads/products/ef73c1ee-46e0-4a86-9188-42eacb00e22e.webp}	\N	\N	15	2026	\N	\N	周辉	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	\N	\N	ENTERPRISE	{}	\N	\N	2026-07-21 11:59:38.677	cmprziifr000763g8vjb4v75f	APPROVED	2026-07-21 11:59:03.432	\N	\N	5F001-8-18, Block D, No.89 Yintai Rd, Hongjia Subdistrict, Jiaojiang District, Taizhou, Zhejiang, China	10000	91331002MAKHM19P30	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N
cms7hnym90001jcg8amt2id06	cms7hnylg0000jcg8hd5haiml	CB CERATIZIT Cutting Tools (Shanghai) Co., Ltd.	MANUFACTURER	Luxembourg	Unknown	101, Route de Holzem L-8232 Mamer Luxembourg	+44 800 732 073	info.uk@ceratizit.com	https://cuttingtools.ceratizit.com	\N	\N	\N	\N	FREE_TRIAL	2026-08-29 12:27:30.169	f	t	2026-07-30 12:27:30.177	2026-07-30 12:38:13.173	\N	\N	f	\N	\N	\N	\N	\N		18627407019		f	\N	f	\N	\N	\N	\N	\N	\N	{"en": "Overview\\n\\nThe CERATIZIT Group is a high-technology engineering group specializing in cutting tools and hard material solutions. As a private company with its registered office in Mamer, Luxembourg, it is a global leader in the carbide industry. The company is wholly owned by the Plansee Group.\\n\\nWith over 100 years of industry experience, CERATIZIT develops and manufactures highly specialized cutting tools, indexable inserts, carbide rods, and wear parts. It manages the entire production process chain for cemented carbide components—from powder preparation to forming, sintering, finishing, and surface treatment.\\nKey Facts & Figures\\n\\n    Founded: 2002 (from the merger of CERAMETAL and Plansee Tizit)\\n\\n    Headquarters: Mamer, Luxembourg\\n\\n    Employees: Over 9,000 worldwide\\n\\n    Production Sites: More than 30 facilities across Europe, Asia, and North America\\n\\n    Patents: Holds over 1,000 patents and utility models globally\\n\\n    R&D: Employs over 200 specialists in research and development\\n\\nHistory\\n\\nThe company's roots trace back to the pioneering work of its predecessors. CERAMETAL was founded in Luxembourg in 1931 by Dr. Nicolas Lanners, while Plansee Tizit was established in 1985. In 2002, these two companies merged to form CERATIZIT S.A., creating a new global player in the carbide industry. Since June 2021, the Plansee Group has held a majority stake in the company.\\nBusiness & Products\\n\\nCERATIZIT's business is built on providing advanced solutions for machining and wear protection. Its core product portfolio includes:\\n\\n    Cutting Tools: Highly specialized tools for various machining applications.\\n\\n    Indexable Inserts: For turning, milling, and drilling operations.\\n\\n    Carbide Rods: Solid carbide blanks for manufacturing custom tools.\\n\\n    Wear Parts: Components designed to protect equipment from abrasion and wear.\\n\\n    Advanced Materials: Continuous development of new carbide, cermet, and ceramic grades for specialized applications, including wood and stone working.\\n\\nThe company is a global market leader in numerous application segments and offers a broad portfolio of both standard products and custom solutions.\\nGlobal Footprint\\n\\nCERATIZIT operates a vast international network. It has over 30 production sites worldwide and a sales network with more than 70 branches, ensuring a local presence for its customers. Key production and sales regions include Europe, North America, and Asia.\\n\\nIts presence in Asia is significantly strengthened through its joint venture, CB-CERATIZIT, which was established in 2010. This entity combines the expertise of CERATIZIT with the regional knowledge of its partners to serve the Asian market.\\nInnovation & Sustainability\\n\\nInnovation is a cornerstone of CERATIZIT's success. The company has received more than 25 innovation awards since 2002 and holds over 1,000 patents. This commitment to R&D has led to award-winning tool solutions and coatings.\\n\\nSustainability is also a key priority. CERATIZIT actively engages in recycling programs to responsibly manage resources. Its commitment to environmental responsibility has been recognized with an EcoVadis Gold Rating. The company has also achieved a CDP rating of B for Climate Change.", "zh": "General trading and procurement services, including but not limited to:\\n\\nImport and export agency; wholesale and retail of cosmetics, hardware, toys, kitchenware, footwear, garments, stationery, electronics, daily necessities, chemical products (excluding hazardous chemicals), medical devices (Class I), home furnishings, plastic products, metal products, handicrafts, and art collectibles (excluding ivory products);\\n\\nSales of fire-fighting equipment, coatings (excluding hazardous chemicals), computer hardware and software, building materials, textiles, luggage, sporting goods, photovoltaic equipment, EV charging stations, non-ferrous metal alloys, agricultural and food processing machinery, and general machinery;\\n\\nTechnical services, development, consultation, and transfer; internet sales (excluding restricted items); trade brokerage; software development and sales; import and export of technology and goods;\\n\\nFood business: sales of prepackaged food (limited to prepackaged food only) and online sales of prepackaged food.\\n\\nValue-added services: one-stop procurement agency, supplier sourcing and development, OEM/ODM manufacturing coordination, quality control, and supply chain management."}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ENTERPRISE	\N	\N	\N	\N	\N	DRAFT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cms8kds1s0000yng8enf0bxbb	cmrub544e00023og83s8z226p	台州绘寰国际商贸有限公司	MANUFACTURER	China	Taizhou	No. 89 Yintai Road, Hongjia Street, Jiaojiang District, Building D, 5F001-8-18	+8618627407019	sardenesy@gmail.com	https://fixr2026.com	\N	/uploads/products/e576ad5c-0fdc-4028-aee3-543453db6a1c.webp	/uploads/products/182bb9e9-9ecd-4f7d-b41b-c3421fa2b3b4.webp	\N	FREE_TRIAL	\N	f	t	2026-07-31 06:31:20.128	2026-07-31 09:48:43.342	{}	\N	f	\N	\N					18627407019		f	\N	f	\N	\N	\N	\N	\N	\N	{"en": "Taizhou Huihuan International Trading Co., Ltd. is a premier global sourcing partner with deep-rooted expertise in the furniture industry. We operate across ALL industries and product lines—provided they are legal and compliant. Our portfolio spans consumer goods (cosmetics, toys, garments, electronics), industrial supplies (hardware, metals, chemicals, machinery), medical devices, building materials, and renewable energy equipment.\\nWe offer three core services: ① Supplier Sourcing & Development, ② One-Stop Procurement Agency, and ③ Overseas Market Promotion. We adopt a direct-settlement model—all contracts and payments are concluded directly between the buyer and the supplier, while we ensure quality control, logistics coordination, and transparent communication.", "zh": "Taizhou Huihuan International Trading Co., Ltd. is a premier global sourcing partner with deep-rooted expertise in the furniture industry. We operate across ALL industries and product lines—provided they are legal and compliant. Our portfolio spans consumer goods (cosmetics, toys, garments, electronics), industrial supplies (hardware, metals, chemicals, machinery), medical devices, building materials, and renewable energy equipment.\\nWe offer three core services: ① Supplier Sourcing & Development, ② One-Stop Procurement Agency, and ③ Overseas Market Promotion. We adopt a direct-settlement model—all contracts and payments are concluded directly between the buyer and the supplier, while we ensure quality control, logistics coordination, and transparent communication."}	{}	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ENTERPRISE	{}	\N	\N	2026-07-31 09:48:43.336	cmprziifr000763g8vjb4v75f	APPROVED	2026-07-31 09:48:06.605	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	\N	\N	\N	Zhouhui
\.


--
-- Data for Name: SellerVerificationFile; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."SellerVerificationFile" (id, "sellerId", "fileType", "fileUrl", "fileName", "fileSize", "mimeType", "isVerified", "verifiedAt", "verifiedBy", "sortOrder", description, "createdAt", "updatedAt", "certificateName", "certificateNumber", "expiryDate", "issueDate", "issuingAuthority") FROM stdin;
cmrukdb9t0001ycg8xmho07ut	cmruibk9q00024ig83uq02u99	ID_CARD	/uploads/verification/cmruibk9q00024ig83uq02u99/1784632931915___.jpg	正面.jpg	506292	image/jpeg	f	\N	\N	0	\N	2026-07-21 11:22:11.921	2026-07-21 11:22:11.921	\N	\N	\N	\N	\N
cmrukdkee0002ycg8uzufltw6	cmruibk9q00024ig83uq02u99	PHOTO	/uploads/verification/cmruibk9q00024ig83uq02u99/1784632943738_____.jpg	个人照片.jpg	2043580	image/jpeg	f	\N	\N	0	\N	2026-07-21 11:22:23.75	2026-07-21 11:22:23.75	\N	\N	\N	\N	\N
\.


--
-- Data for Name: ShoutOut; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."ShoutOut" (id, content, "senderId", "isFree", cost, "paymentId", priority, "expiresAt", "viewCount", "clickCount", reactions, "createdAt", location, tags, type) FROM stdin;
\.


--
-- Data for Name: StoreBrochure; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."StoreBrochure" (id, "sellerId", title, "fileUrl", "fileName", "fileSize", "sortOrder", "downloadCount", "createdAt") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."SystemSetting" (id, key, value, description, "createdAt", "updatedAt") FROM stdin;
cmrxehiis0000mjg8zri12n5b	payment_config	{"minFee": 0, "enabled": true, "feeRate": 0, "bankName": "", "bankSwift": "", "bankAccount": "", "qrCodeAlipay": "", "qrCodePaypal": "", "qrCodeWeChat": ""}	平台收款配置	2026-07-23 11:00:48.772	2026-07-23 11:20:56.255
\.


--
-- Data for Name: TaskApplication; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."TaskApplication" (id, "taskId", "applicantId", message, quote, "deliveryTime", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TaskDeliverable; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."TaskDeliverable" (id, "taskId", title, description, files, "submittedAt", status, "reviewNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TaskEscrow; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."TaskEscrow" (id, "taskId", amount, currency, "holdAmount", "releaseAmount", status, "transactionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TaskMilestone; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."TaskMilestone" (id, "taskId", title, description, amount, "order", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Topic; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Topic" (id, "userId", title, content, category, images, videos, documents, link, phone, "viewCount", "likeCount", "commentCount", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TopicComment; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."TopicComment" (id, "topicId", "userId", content, "parentId", "likeCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TopicLike; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."TopicLike" (id, "userId", "topicId", "commentId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Unit" (id, name, "nameEn", symbol, description, "isEnabled", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmrvptyzx00043yg8v3vfmppt	个	Piece	PC	最基本的货物件数计量（如单个螺丝、单个手机）	t	0	2026-07-22 06:42:53.421	2026-07-22 06:42:53.421
cmrvpupbl00053yg8fi4bjw1d	双	Pair	PR	成对出售的货物（如手套、鞋子、轮对）	t	0	2026-07-22 06:43:27.537	2026-07-22 06:43:27.537
cmrvpvbmj00063yg8kn6q2pvi	套	Set	SET	配套组合出售（如工具箱套装、床上用品四件套）	t	0	2026-07-22 06:43:56.443	2026-07-22 06:43:56.443
cmrvpw4pl00073yg8hz1opq6h	Group	组	GRP	由若干零件组成的一个功能组	t	0	2026-07-22 06:44:34.137	2026-07-22 06:44:34.137
cmrvpwuc200083yg8w322itp8	副	Pair	PRS	常用于成对且不可分割的部件（如眼镜架、轴承配对）	t	0	2026-07-22 06:45:07.346	2026-07-22 06:45:07.346
cmrvpxgmt00093yg8f8s1ud2n	箱	Carton	CTN	外包装纸箱（B2B出货最小外包装单位）	t	0	2026-07-22 06:45:36.245	2026-07-22 06:45:36.245
cmrvpy7cn000a3yg8on11hzxf	盒	Box	BOX	内包装小盒（如礼品盒包装）	t	0	2026-07-22 06:46:10.871	2026-07-22 06:46:10.871
cmrvpywdv000b3yg80r7eud5j	袋	Bag	BAG	袋装货物（如化工原料、颗粒料）	t	0	2026-07-22 06:46:43.315	2026-07-22 06:46:43.315
cmrvpzm6h000c3yg8c3o230vr	包	Bag	BAG	袋装货物（如化工原料、颗粒料）	t	0	2026-07-22 06:47:16.745	2026-07-22 06:47:16.745
cmrvq0a3u000d3yg821cmhhmb	卷	Roll	ROL	卷状货物（如布料、薄膜、电线电缆）	t	0	2026-07-22 06:47:47.754	2026-07-22 06:47:47.754
cmrvq13m0000e3yg8driwg5vg	捆	Bundle	BDL	捆扎打包的货物（如钢管、纸板、木方）	t	0	2026-07-22 06:48:25.992	2026-07-22 06:48:25.992
cmrvq2036000f3yg8rbsefqod	托盘	Palle	PLT	集装运输基座（用于叉车搬运的整托计价）	t	0	2026-07-22 06:49:08.082	2026-07-22 06:49:08.082
cmrvq33zw000g3yg8fe7f2p2l	桶	Drum	DRM	大容量液体或粉末桶装（如润滑油、化学品）	t	0	2026-07-22 06:49:59.804	2026-07-22 06:49:59.804
cmrvq3qa2000h3yg86j3enuww	罐	Can	CAN	小金属罐装（如密封胶、油漆）	t	0	2026-07-22 06:50:28.682	2026-07-22 06:50:28.682
cmrvptai700033yg8oqr33s3o	件	Piece	PCS	最基本的货物件数计量（如单个螺丝、单个手机）	f	0	2026-07-22 06:42:21.679	2026-07-22 06:50:32.57
cmrvq4jnl000i3yg8ewno8p9s	千克	Kilogram	KG	按重量结算（绝大多数原材料、散货）	t	0	2026-07-22 06:51:06.753	2026-07-22 06:51:06.753
cmrvq53hy000j3yg89qpcwczu	吨	Ton	T	大批量采购（如煤炭、钢材、谷物）	t	0	2026-07-22 06:51:32.47	2026-07-22 06:51:32.47
cmrvq5naz000k3yg8q69flsin	克	Gram	G	贵重或微量物料（如贵金属粉末、添加剂）	t	0	2026-07-22 06:51:58.139	2026-07-22 06:51:58.139
cmrvq678k000l3yg85p6wm1as	米	Meter	M	按长度计价（如管材、型材、缆绳）	t	0	2026-07-22 06:52:23.972	2026-07-22 06:52:23.972
cmrvq72jd000m3yg8zkhxyicj	平方米	Square Meter	M²	按面积计价（如钢板、皮革、纸张）	t	0	2026-07-22 06:53:04.537	2026-07-22 06:53:04.537
cmrvq84g0000n3yg8fcgob3fe	立方米	Cubic Meter	M³	按体积计价（主要用于海运费计算和散货）	t	0	2026-07-22 06:53:53.664	2026-07-22 06:53:53.664
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."User" (id, email, username, password, role, "isActive", "lastLoginAt", "createdAt", "updatedAt", "avatarUrl", bio, company, "displayName", location, phone, website, "aiCapabilities", "aiModel", "aiProvider", "dailyShoutOuts", "isOnline", "isSystemAI", "lastSeenAt", "lastShoutOutDate", "resetToken", "resetTokenExpiry", balance, "chatSystemLinkedAt", "chatSystemToken", "chatSystemUserId", "isAI", "ownerId", "receiveNotices") FROM stdin;
cms7hnylg0000jcg8hd5haiml	1994169578@qq.com	团队切削	$2b$10$SgmN14N/TKL2o/MWzVvrcO12ZwkvNe9eqvjZ4n19fuBs2mrPsRKWa	SELLER	t	2026-07-31 06:45:53.901	2026-07-30 12:27:30.148	2026-07-31 06:45:53.902	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	f	f	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	t
cmprziifr000763g8vjb4v75f	1994169577@qq.com	sardenesy	$2b$10$x1V08GQFfVD9bfk0OYU59.MyXtjQKdzfXq0EE.tmOIQ9n2acg9LU.	ADMIN	t	2026-07-31 07:52:17.509	2026-07-18 11:16:32.717	2026-07-31 07:52:17.51	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	f	f	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	t
cmrub544e00023og83s8z226p	sardenesy@gmail.com	huihuan	$2b$10$SSsK6wSX9SeN5UgFbCUC4OtZIUqa4w1tdUIBTa3cLQ6qTGyGJehBm	SELLER	t	2026-07-31 09:30:51.521	2026-07-21 07:03:52.862	2026-07-31 09:30:51.525	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	f	f	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	t
\.


--
-- Data for Name: VerificationCountry; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."VerificationCountry" (id, name, "nameZh", "isEnabled", "createdAt", "updatedAt") FROM stdin;
vc001	China	中国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc002	United States	美国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc003	Germany	德国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc004	Japan	日本	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc005	South Korea	韩国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc006	United Kingdom	英国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc007	France	法国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc008	Italy	意大利	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc009	Spain	西班牙	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc010	Canada	加拿大	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc011	Australia	澳大利亚	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc012	Brazil	巴西	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc013	India	印度	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc014	Russia	俄罗斯	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc015	Singapore	新加坡	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc016	Malaysia	马来西亚	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc017	Thailand	泰国	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc018	Vietnam	越南	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc019	Indonesia	印度尼西亚	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
vc020	Mexico	墨西哥	t	2026-07-21 12:34:20.626	2026-07-21 12:34:20.626
\.


--
-- Data for Name: VerificationRequest; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."VerificationRequest" (id, "userId", "listingId", "shippingCountry", "detailedAddress", status, "feeAmount", "feeCurrency", notes, "reviewedBy", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Visitor; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Visitor" (id, "ipHash", "productId", "sellerId", "viewerId", country, "countryCode", city, region, timezone, isp, "userAgent", url, "isSelfView", "createdAt") FROM stdin;
cms5qrxnw0001cig8hgor3dx5	756fc685	\N	\N	\N	China	CN	Beijing	Beijing	Asia/Shanghai	CHINANET	curl/8.5.0	\N	f	2026-07-29 07:06:59.756
cms5ydv7p000080g88rokhjad	5b6b031b	cmrvnjs8l00013yg8k4y2jahz	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/pt/products/cmrvnjs8l00013yg8k4y2jahz	f	2026-07-29 10:40:00.326
cms63ysxo000180g8kflopi4g	2657487c	cmrxj9n4f0006o0g82vwjhxhq	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/ru/products/cmrxj9n4f0006o0g82vwjhxhq	f	2026-07-29 13:16:15.228
cms69ma21000280g8fqplur0t	5b6aff5a	cmrxjvtio0008o0g82saqynas	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/ja/products/cmrxjvtio0008o0g82saqynas	f	2026-07-29 15:54:28.585
cms69syn9000380g8kqg2qvve	5b6c2428	cmrxjvtio0008o0g82saqynas	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/zh/products/cmrxjvtio0008o0g82saqynas	f	2026-07-29 15:59:40.389
cms6aevan000480g8ird8hwoi	265753bf	cmrxjvtio0008o0g82saqynas	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/pt/products/cmrxjvtio0008o0g82saqynas	f	2026-07-29 16:16:42.479
cms6b7ecr000580g8oi1u214p	5b6c4230	cmrxj9n4f0006o0g82vwjhxhq	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/ar/products/cmrxj9n4f0006o0g82vwjhxhq	f	2026-07-29 16:38:53.547
cms6c852q000680g81mlb2k77	5b6b7b3b	cmrxjvtio0008o0g82saqynas	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/ar/products/cmrxjvtio0008o0g82saqynas	f	2026-07-29 17:07:27.794
cms6dtfnq000780g81f5bjvgo	5b6c54f5	cmrxjvtio0008o0g82saqynas	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/fr/products/cmrxjvtio0008o0g82saqynas	f	2026-07-29 17:52:00.902
cms6ef1go000880g8m9lx16zp	5b6bd192	cmrxi9y8c0003o0g8cxl7f7d0	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/ar/products/cmrxi9y8c0003o0g8cxl7f7d0	f	2026-07-29 18:08:48.936
cms6fjiqj000980g8fttacex8	5b6b64b5	cmrxj9n4f0006o0g82vwjhxhq	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/hi/products/cmrxj9n4f0006o0g82vwjhxhq	f	2026-07-29 18:40:17.563
cms72g57w000b80g881r63k1m	7f71842a	cms5p31bc0006cbg8ma54rfal	cmruibk9q00024ig83uq02u99	\N	Germany	DE	Frankfurt am Main	Hesse	Europe/Berlin	DigitalOcean, LLC	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) TraeCN/1.107.1 Chrome/142.0.7444.235 Electron/39.2.7 Safari/537.36	https://x2xhub.com/en/products/cms5p31bc0006cbg8ma54rfal	f	2026-07-30 05:21:31.244
cms72gj3p000c80g805rvvvpc	7f71842a	cms5p31bc0006cbg8ma54rfal	cmruibk9q00024ig83uq02u99	\N	Germany	DE	Frankfurt am Main	Hesse	Europe/Berlin	DigitalOcean, LLC	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) TraeCN/1.107.1 Chrome/142.0.7444.235 Electron/39.2.7 Safari/537.36	https://x2xhub.com/en/products/cms5p31bc0006cbg8ma54rfal	f	2026-07-30 05:21:49.237
cms99m4jv0000qhg8y0dknqnn	265753bf	cms09dndq001fo0g86hv165je	cmruibk9q00024ig83uq02u99	\N	United States	US	Ashburn	Virginia	America/New_York	Facebook, Inc.	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))	https://x2xhub.com/es/products/cms09dndq001fo0g86hv165je	f	2026-07-31 18:17:39.979
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."Wallet" (id, "userId", balance, currency, "totalDeposited", "totalWithdrawn", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WalletTransaction; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."WalletTransaction" (id, "walletId", type, amount, status, currency, reference, description, gateway, "gatewayTxId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WithdrawalRequest; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."WithdrawalRequest" (id, "userId", amount, currency, gateway, "gatewayDetails", status, "reviewedByAdmin", "reviewedAt", "reviewNotes", "gatewayTxId", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorldChatMessage; Type: TABLE DATA; Schema: public; Owner: expo_dev
--

COPY public."WorldChatMessage" (id, content, "senderId", "isFree", cost, "createdAt") FROM stdin;
\.


--
-- Name: AIAgentAuditLog AIAgentAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIAgentAuditLog"
    ADD CONSTRAINT "AIAgentAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: AIAgent AIAgent_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIAgent"
    ADD CONSTRAINT "AIAgent_pkey" PRIMARY KEY (id);


--
-- Name: AIAuditLog AIAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIAuditLog"
    ADD CONSTRAINT "AIAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: AIPermission AIPermission_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIPermission"
    ADD CONSTRAINT "AIPermission_pkey" PRIMARY KEY (id);


--
-- Name: APIKey APIKey_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."APIKey"
    ADD CONSTRAINT "APIKey_pkey" PRIMARY KEY (id);


--
-- Name: APIUsageLog APIUsageLog_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."APIUsageLog"
    ADD CONSTRAINT "APIUsageLog_pkey" PRIMARY KEY (id);


--
-- Name: AuctionBid AuctionBid_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionBid"
    ADD CONSTRAINT "AuctionBid_pkey" PRIMARY KEY (id);


--
-- Name: AuctionListing AuctionListing_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionListing"
    ADD CONSTRAINT "AuctionListing_pkey" PRIMARY KEY (id);


--
-- Name: BlogComment BlogComment_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_pkey" PRIMARY KEY (id);


--
-- Name: BlogLike BlogLike_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogLike"
    ADD CONSTRAINT "BlogLike_pkey" PRIMARY KEY (id);


--
-- Name: Blog Blog_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_pkey" PRIMARY KEY (id);


--
-- Name: BoothCustomization BoothCustomization_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BoothCustomization"
    ADD CONSTRAINT "BoothCustomization_pkey" PRIMARY KEY (id);


--
-- Name: BoothView BoothView_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BoothView"
    ADD CONSTRAINT "BoothView_pkey" PRIMARY KEY (id);


--
-- Name: Booth Booth_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Booth"
    ADD CONSTRAINT "Booth_pkey" PRIMARY KEY (id);


--
-- Name: BrochureDownload BrochureDownload_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BrochureDownload"
    ADD CONSTRAINT "BrochureDownload_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ContactView ContactView_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ContactView"
    ADD CONSTRAINT "ContactView_pkey" PRIMARY KEY (id);


--
-- Name: DeadLink DeadLink_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."DeadLink"
    ADD CONSTRAINT "DeadLink_pkey" PRIMARY KEY (id);


--
-- Name: DigitalVoucherTransaction DigitalVoucherTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."DigitalVoucherTransaction"
    ADD CONSTRAINT "DigitalVoucherTransaction_pkey" PRIMARY KEY (id);


--
-- Name: DigitalVoucher DigitalVoucher_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."DigitalVoucher"
    ADD CONSTRAINT "DigitalVoucher_pkey" PRIMARY KEY (id);


--
-- Name: GoodsVerificationRecord GoodsVerificationRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."GoodsVerificationRecord"
    ADD CONSTRAINT "GoodsVerificationRecord_pkey" PRIMARY KEY (id);


--
-- Name: Inquiry Inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_pkey" PRIMARY KEY (id);


--
-- Name: LogisticsUpdate LogisticsUpdate_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."LogisticsUpdate"
    ADD CONSTRAINT "LogisticsUpdate_pkey" PRIMARY KEY (id);


--
-- Name: MarketplaceTask MarketplaceTask_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."MarketplaceTask"
    ADD CONSTRAINT "MarketplaceTask_pkey" PRIMARY KEY (id);


--
-- Name: Notice Notice_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Notice"
    ADD CONSTRAINT "Notice_pkey" PRIMARY KEY (id);


--
-- Name: PaymentProof PaymentProof_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PaymentProof"
    ADD CONSTRAINT "PaymentProof_pkey" PRIMARY KEY (id);


--
-- Name: PlatformFee PlatformFee_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PlatformFee"
    ADD CONSTRAINT "PlatformFee_pkey" PRIMARY KEY (id);


--
-- Name: PrivateMessage PrivateMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PrivateMessage"
    ADD CONSTRAINT "PrivateMessage_pkey" PRIMARY KEY (id);


--
-- Name: ProductBrochure ProductBrochure_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ProductBrochure"
    ADD CONSTRAINT "ProductBrochure_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: PublicMessage PublicMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PublicMessage"
    ADD CONSTRAINT "PublicMessage_pkey" PRIMARY KEY (id);


--
-- Name: ReviewHelpfulVote ReviewHelpfulVote_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ReviewHelpfulVote"
    ADD CONSTRAINT "ReviewHelpfulVote_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SEOConfig SEOConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."SEOConfig"
    ADD CONSTRAINT "SEOConfig_pkey" PRIMARY KEY (id);


--
-- Name: SellerProfile SellerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."SellerProfile"
    ADD CONSTRAINT "SellerProfile_pkey" PRIMARY KEY (id);


--
-- Name: SellerVerificationFile SellerVerificationFile_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."SellerVerificationFile"
    ADD CONSTRAINT "SellerVerificationFile_pkey" PRIMARY KEY (id);


--
-- Name: ShoutOut ShoutOut_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ShoutOut"
    ADD CONSTRAINT "ShoutOut_pkey" PRIMARY KEY (id);


--
-- Name: StoreBrochure StoreBrochure_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."StoreBrochure"
    ADD CONSTRAINT "StoreBrochure_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- Name: TaskApplication TaskApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskApplication"
    ADD CONSTRAINT "TaskApplication_pkey" PRIMARY KEY (id);


--
-- Name: TaskDeliverable TaskDeliverable_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskDeliverable"
    ADD CONSTRAINT "TaskDeliverable_pkey" PRIMARY KEY (id);


--
-- Name: TaskEscrow TaskEscrow_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskEscrow"
    ADD CONSTRAINT "TaskEscrow_pkey" PRIMARY KEY (id);


--
-- Name: TaskMilestone TaskMilestone_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskMilestone"
    ADD CONSTRAINT "TaskMilestone_pkey" PRIMARY KEY (id);


--
-- Name: TopicComment TopicComment_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicComment"
    ADD CONSTRAINT "TopicComment_pkey" PRIMARY KEY (id);


--
-- Name: TopicLike TopicLike_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicLike"
    ADD CONSTRAINT "TopicLike_pkey" PRIMARY KEY (id);


--
-- Name: Topic Topic_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_pkey" PRIMARY KEY (id);


--
-- Name: Unit Unit_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationCountry VerificationCountry_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."VerificationCountry"
    ADD CONSTRAINT "VerificationCountry_pkey" PRIMARY KEY (id);


--
-- Name: VerificationRequest VerificationRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."VerificationRequest"
    ADD CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY (id);


--
-- Name: Visitor Visitor_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Visitor"
    ADD CONSTRAINT "Visitor_pkey" PRIMARY KEY (id);


--
-- Name: WalletTransaction WalletTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: WithdrawalRequest WithdrawalRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."WithdrawalRequest"
    ADD CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY (id);


--
-- Name: WorldChatMessage WorldChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."WorldChatMessage"
    ADD CONSTRAINT "WorldChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: AIAgentAuditLog_action_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAgentAuditLog_action_idx" ON public."AIAgentAuditLog" USING btree (action);


--
-- Name: AIAgentAuditLog_agentId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAgentAuditLog_agentId_idx" ON public."AIAgentAuditLog" USING btree ("agentId");


--
-- Name: AIAgentAuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAgentAuditLog_createdAt_idx" ON public."AIAgentAuditLog" USING btree ("createdAt");


--
-- Name: AIAgent_apiKey_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAgent_apiKey_idx" ON public."AIAgent" USING btree ("apiKey");


--
-- Name: AIAgent_apiKey_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "AIAgent_apiKey_key" ON public."AIAgent" USING btree ("apiKey");


--
-- Name: AIAgent_ownerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAgent_ownerId_idx" ON public."AIAgent" USING btree ("ownerId");


--
-- Name: AIAgent_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAgent_status_idx" ON public."AIAgent" USING btree (status);


--
-- Name: AIAuditLog_action_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAuditLog_action_idx" ON public."AIAuditLog" USING btree (action);


--
-- Name: AIAuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAuditLog_createdAt_idx" ON public."AIAuditLog" USING btree ("createdAt");


--
-- Name: AIAuditLog_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIAuditLog_userId_idx" ON public."AIAuditLog" USING btree ("userId");


--
-- Name: AIPermission_permission_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIPermission_permission_idx" ON public."AIPermission" USING btree (permission);


--
-- Name: AIPermission_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AIPermission_userId_idx" ON public."AIPermission" USING btree ("userId");


--
-- Name: APIKey_isActive_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "APIKey_isActive_idx" ON public."APIKey" USING btree ("isActive");


--
-- Name: APIKey_key_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "APIKey_key_idx" ON public."APIKey" USING btree (key);


--
-- Name: APIKey_key_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "APIKey_key_key" ON public."APIKey" USING btree (key);


--
-- Name: APIKey_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "APIKey_userId_idx" ON public."APIKey" USING btree ("userId");


--
-- Name: APIUsageLog_apiKeyId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "APIUsageLog_apiKeyId_idx" ON public."APIUsageLog" USING btree ("apiKeyId");


--
-- Name: APIUsageLog_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "APIUsageLog_createdAt_idx" ON public."APIUsageLog" USING btree ("createdAt");


--
-- Name: APIUsageLog_endpoint_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "APIUsageLog_endpoint_idx" ON public."APIUsageLog" USING btree (endpoint);


--
-- Name: AuctionBid_bidderId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionBid_bidderId_idx" ON public."AuctionBid" USING btree ("bidderId");


--
-- Name: AuctionBid_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionBid_createdAt_idx" ON public."AuctionBid" USING btree ("createdAt");


--
-- Name: AuctionBid_listingId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionBid_listingId_idx" ON public."AuctionBid" USING btree ("listingId");


--
-- Name: AuctionBid_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionBid_status_idx" ON public."AuctionBid" USING btree (status);


--
-- Name: AuctionListing_category_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_category_idx" ON public."AuctionListing" USING btree (category);


--
-- Name: AuctionListing_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_createdAt_idx" ON public."AuctionListing" USING btree ("createdAt");


--
-- Name: AuctionListing_isVerified_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_isVerified_idx" ON public."AuctionListing" USING btree ("isVerified");


--
-- Name: AuctionListing_posterId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_posterId_idx" ON public."AuctionListing" USING btree ("posterId");


--
-- Name: AuctionListing_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_status_idx" ON public."AuctionListing" USING btree (status);


--
-- Name: AuctionListing_type_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_type_idx" ON public."AuctionListing" USING btree (type);


--
-- Name: AuctionListing_verificationStatus_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "AuctionListing_verificationStatus_idx" ON public."AuctionListing" USING btree ("verificationStatus");


--
-- Name: BlogComment_blogId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BlogComment_blogId_idx" ON public."BlogComment" USING btree ("blogId");


--
-- Name: BlogComment_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BlogComment_userId_idx" ON public."BlogComment" USING btree ("userId");


--
-- Name: BlogLike_userId_blogId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "BlogLike_userId_blogId_key" ON public."BlogLike" USING btree ("userId", "blogId");


--
-- Name: BlogLike_userId_commentId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "BlogLike_userId_commentId_key" ON public."BlogLike" USING btree ("userId", "commentId");


--
-- Name: Blog_category_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Blog_category_idx" ON public."Blog" USING btree (category);


--
-- Name: Blog_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Blog_createdAt_idx" ON public."Blog" USING btree ("createdAt");


--
-- Name: Blog_isPublished_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Blog_isPublished_idx" ON public."Blog" USING btree ("isPublished");


--
-- Name: Blog_slug_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Blog_slug_idx" ON public."Blog" USING btree (slug);


--
-- Name: Blog_slug_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "Blog_slug_key" ON public."Blog" USING btree (slug);


--
-- Name: BoothCustomization_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BoothCustomization_sellerId_idx" ON public."BoothCustomization" USING btree ("sellerId");


--
-- Name: BoothCustomization_type_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BoothCustomization_type_idx" ON public."BoothCustomization" USING btree (type);


--
-- Name: BoothView_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BoothView_sellerId_idx" ON public."BoothView" USING btree ("sellerId");


--
-- Name: BoothView_viewedAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BoothView_viewedAt_idx" ON public."BoothView" USING btree ("viewedAt");


--
-- Name: BoothView_viewerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BoothView_viewerId_idx" ON public."BoothView" USING btree ("viewerId");


--
-- Name: Booth_boothNumber_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "Booth_boothNumber_key" ON public."Booth" USING btree ("boothNumber");


--
-- Name: Booth_isActive_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Booth_isActive_idx" ON public."Booth" USING btree ("isActive");


--
-- Name: Booth_isPublished_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Booth_isPublished_idx" ON public."Booth" USING btree ("isPublished");


--
-- Name: Booth_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Booth_sellerId_idx" ON public."Booth" USING btree ("sellerId");


--
-- Name: BrochureDownload_downloadedAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BrochureDownload_downloadedAt_idx" ON public."BrochureDownload" USING btree ("downloadedAt");


--
-- Name: BrochureDownload_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "BrochureDownload_userId_idx" ON public."BrochureDownload" USING btree ("userId");


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: Category_slug_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Category_slug_idx" ON public."Category" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: ContactView_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "ContactView_sellerId_idx" ON public."ContactView" USING btree ("sellerId");


--
-- Name: ContactView_viewerId_sellerId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "ContactView_viewerId_sellerId_key" ON public."ContactView" USING btree ("viewerId", "sellerId");


--
-- Name: DeadLink_detectedAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DeadLink_detectedAt_idx" ON public."DeadLink" USING btree ("detectedAt");


--
-- Name: DeadLink_isResolved_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DeadLink_isResolved_idx" ON public."DeadLink" USING btree ("isResolved");


--
-- Name: DeadLink_url_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "DeadLink_url_key" ON public."DeadLink" USING btree (url);


--
-- Name: DigitalVoucherTransaction_buyerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucherTransaction_buyerId_idx" ON public."DigitalVoucherTransaction" USING btree ("buyerId");


--
-- Name: DigitalVoucherTransaction_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucherTransaction_status_idx" ON public."DigitalVoucherTransaction" USING btree (status);


--
-- Name: DigitalVoucherTransaction_voucherId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucherTransaction_voucherId_idx" ON public."DigitalVoucherTransaction" USING btree ("voucherId");


--
-- Name: DigitalVoucher_certificateNumber_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_certificateNumber_idx" ON public."DigitalVoucher" USING btree ("certificateNumber");


--
-- Name: DigitalVoucher_certificateNumber_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "DigitalVoucher_certificateNumber_key" ON public."DigitalVoucher" USING btree ("certificateNumber");


--
-- Name: DigitalVoucher_isRedeemed_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_isRedeemed_idx" ON public."DigitalVoucher" USING btree ("isRedeemed");


--
-- Name: DigitalVoucher_isVerified_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_isVerified_idx" ON public."DigitalVoucher" USING btree ("isVerified");


--
-- Name: DigitalVoucher_redemptionCode_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_redemptionCode_idx" ON public."DigitalVoucher" USING btree ("redemptionCode");


--
-- Name: DigitalVoucher_redemptionCode_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "DigitalVoucher_redemptionCode_key" ON public."DigitalVoucher" USING btree ("redemptionCode");


--
-- Name: DigitalVoucher_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_sellerId_idx" ON public."DigitalVoucher" USING btree ("sellerId");


--
-- Name: DigitalVoucher_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_status_idx" ON public."DigitalVoucher" USING btree (status);


--
-- Name: DigitalVoucher_verificationStatus_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "DigitalVoucher_verificationStatus_idx" ON public."DigitalVoucher" USING btree ("verificationStatus");


--
-- Name: GoodsVerificationRecord_voucherId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "GoodsVerificationRecord_voucherId_idx" ON public."GoodsVerificationRecord" USING btree ("voucherId");


--
-- Name: Inquiry_buyerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Inquiry_buyerId_idx" ON public."Inquiry" USING btree ("buyerId");


--
-- Name: Inquiry_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Inquiry_sellerId_idx" ON public."Inquiry" USING btree ("sellerId");


--
-- Name: Inquiry_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Inquiry_status_idx" ON public."Inquiry" USING btree (status);


--
-- Name: LogisticsUpdate_voucherId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "LogisticsUpdate_voucherId_idx" ON public."LogisticsUpdate" USING btree ("voucherId");


--
-- Name: MarketplaceTask_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "MarketplaceTask_createdAt_idx" ON public."MarketplaceTask" USING btree ("createdAt");


--
-- Name: MarketplaceTask_postedById_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "MarketplaceTask_postedById_idx" ON public."MarketplaceTask" USING btree ("postedById");


--
-- Name: MarketplaceTask_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "MarketplaceTask_status_idx" ON public."MarketplaceTask" USING btree (status);


--
-- Name: MarketplaceTask_type_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "MarketplaceTask_type_idx" ON public."MarketplaceTask" USING btree (type);


--
-- Name: Notice_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Notice_createdAt_idx" ON public."Notice" USING btree ("createdAt");


--
-- Name: Notice_priority_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Notice_priority_idx" ON public."Notice" USING btree (priority);


--
-- Name: Notice_senderId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Notice_senderId_idx" ON public."Notice" USING btree ("senderId");


--
-- Name: PaymentProof_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PaymentProof_status_idx" ON public."PaymentProof" USING btree (status);


--
-- Name: PaymentProof_submittedAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PaymentProof_submittedAt_idx" ON public."PaymentProof" USING btree ("submittedAt");


--
-- Name: PaymentProof_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PaymentProof_userId_idx" ON public."PaymentProof" USING btree ("userId");


--
-- Name: PlatformFee_feeType_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "PlatformFee_feeType_key" ON public."PlatformFee" USING btree ("feeType");


--
-- Name: PrivateMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PrivateMessage_createdAt_idx" ON public."PrivateMessage" USING btree ("createdAt");


--
-- Name: PrivateMessage_receiverId_senderId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PrivateMessage_receiverId_senderId_idx" ON public."PrivateMessage" USING btree ("receiverId", "senderId");


--
-- Name: PrivateMessage_senderId_receiverId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PrivateMessage_senderId_receiverId_idx" ON public."PrivateMessage" USING btree ("senderId", "receiverId");


--
-- Name: ProductBrochure_productId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "ProductBrochure_productId_idx" ON public."ProductBrochure" USING btree ("productId");


--
-- Name: ProductBrochure_productId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "ProductBrochure_productId_key" ON public."ProductBrochure" USING btree ("productId");


--
-- Name: Product_boothId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Product_boothId_idx" ON public."Product" USING btree ("boothId");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Product_createdAt_idx" ON public."Product" USING btree ("createdAt");


--
-- Name: Product_isActive_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Product_isActive_idx" ON public."Product" USING btree ("isActive");


--
-- Name: Product_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Product_sellerId_idx" ON public."Product" USING btree ("sellerId");


--
-- Name: PublicMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PublicMessage_createdAt_idx" ON public."PublicMessage" USING btree ("createdAt");


--
-- Name: PublicMessage_isAnnouncement_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PublicMessage_isAnnouncement_idx" ON public."PublicMessage" USING btree ("isAnnouncement");


--
-- Name: PublicMessage_messageType_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PublicMessage_messageType_idx" ON public."PublicMessage" USING btree ("messageType");


--
-- Name: PublicMessage_senderId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "PublicMessage_senderId_idx" ON public."PublicMessage" USING btree ("senderId");


--
-- Name: ReviewHelpfulVote_userId_reviewId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "ReviewHelpfulVote_userId_reviewId_key" ON public."ReviewHelpfulVote" USING btree ("userId", "reviewId");


--
-- Name: Review_isActive_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Review_isActive_idx" ON public."Review" USING btree ("isActive");


--
-- Name: Review_productId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");


--
-- Name: Review_rating_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Review_rating_idx" ON public."Review" USING btree (rating);


--
-- Name: Review_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Review_sellerId_idx" ON public."Review" USING btree ("sellerId");


--
-- Name: Review_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Review_userId_idx" ON public."Review" USING btree ("userId");


--
-- Name: SEOConfig_isActive_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SEOConfig_isActive_idx" ON public."SEOConfig" USING btree ("isActive");


--
-- Name: SEOConfig_pagePath_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "SEOConfig_pagePath_key" ON public."SEOConfig" USING btree ("pagePath");


--
-- Name: SEOConfig_pageType_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SEOConfig_pageType_idx" ON public."SEOConfig" USING btree ("pageType");


--
-- Name: SellerProfile_companyName_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SellerProfile_companyName_idx" ON public."SellerProfile" USING btree ("companyName");


--
-- Name: SellerProfile_country_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SellerProfile_country_idx" ON public."SellerProfile" USING btree (country);


--
-- Name: SellerProfile_userId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "SellerProfile_userId_key" ON public."SellerProfile" USING btree ("userId");


--
-- Name: SellerVerificationFile_fileType_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SellerVerificationFile_fileType_idx" ON public."SellerVerificationFile" USING btree ("fileType");


--
-- Name: SellerVerificationFile_isVerified_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SellerVerificationFile_isVerified_idx" ON public."SellerVerificationFile" USING btree ("isVerified");


--
-- Name: SellerVerificationFile_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SellerVerificationFile_sellerId_idx" ON public."SellerVerificationFile" USING btree ("sellerId");


--
-- Name: ShoutOut_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "ShoutOut_createdAt_idx" ON public."ShoutOut" USING btree ("createdAt");


--
-- Name: ShoutOut_priority_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "ShoutOut_priority_idx" ON public."ShoutOut" USING btree (priority);


--
-- Name: ShoutOut_senderId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "ShoutOut_senderId_idx" ON public."ShoutOut" USING btree ("senderId");


--
-- Name: StoreBrochure_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "StoreBrochure_sellerId_idx" ON public."StoreBrochure" USING btree ("sellerId");


--
-- Name: SystemSetting_key_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "SystemSetting_key_idx" ON public."SystemSetting" USING btree (key);


--
-- Name: SystemSetting_key_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "SystemSetting_key_key" ON public."SystemSetting" USING btree (key);


--
-- Name: TaskApplication_applicantId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskApplication_applicantId_idx" ON public."TaskApplication" USING btree ("applicantId");


--
-- Name: TaskApplication_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskApplication_status_idx" ON public."TaskApplication" USING btree (status);


--
-- Name: TaskApplication_taskId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskApplication_taskId_idx" ON public."TaskApplication" USING btree ("taskId");


--
-- Name: TaskDeliverable_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskDeliverable_status_idx" ON public."TaskDeliverable" USING btree (status);


--
-- Name: TaskDeliverable_taskId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskDeliverable_taskId_idx" ON public."TaskDeliverable" USING btree ("taskId");


--
-- Name: TaskEscrow_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskEscrow_status_idx" ON public."TaskEscrow" USING btree (status);


--
-- Name: TaskEscrow_taskId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskEscrow_taskId_idx" ON public."TaskEscrow" USING btree ("taskId");


--
-- Name: TaskEscrow_taskId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "TaskEscrow_taskId_key" ON public."TaskEscrow" USING btree ("taskId");


--
-- Name: TaskMilestone_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskMilestone_status_idx" ON public."TaskMilestone" USING btree (status);


--
-- Name: TaskMilestone_taskId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TaskMilestone_taskId_idx" ON public."TaskMilestone" USING btree ("taskId");


--
-- Name: TopicComment_parentId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TopicComment_parentId_idx" ON public."TopicComment" USING btree ("parentId");


--
-- Name: TopicComment_topicId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TopicComment_topicId_idx" ON public."TopicComment" USING btree ("topicId");


--
-- Name: TopicComment_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TopicComment_userId_idx" ON public."TopicComment" USING btree ("userId");


--
-- Name: TopicLike_commentId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TopicLike_commentId_idx" ON public."TopicLike" USING btree ("commentId");


--
-- Name: TopicLike_topicId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TopicLike_topicId_idx" ON public."TopicLike" USING btree ("topicId");


--
-- Name: TopicLike_userId_commentId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "TopicLike_userId_commentId_key" ON public."TopicLike" USING btree ("userId", "commentId");


--
-- Name: TopicLike_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "TopicLike_userId_idx" ON public."TopicLike" USING btree ("userId");


--
-- Name: TopicLike_userId_topicId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "TopicLike_userId_topicId_key" ON public."TopicLike" USING btree ("userId", "topicId");


--
-- Name: Topic_category_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Topic_category_idx" ON public."Topic" USING btree (category);


--
-- Name: Topic_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Topic_createdAt_idx" ON public."Topic" USING btree ("createdAt");


--
-- Name: Topic_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Topic_userId_idx" ON public."Topic" USING btree ("userId");


--
-- Name: Unit_isEnabled_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Unit_isEnabled_idx" ON public."Unit" USING btree ("isEnabled");


--
-- Name: Unit_name_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Unit_name_idx" ON public."Unit" USING btree (name);


--
-- Name: User_dailyShoutOuts_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "User_dailyShoutOuts_idx" ON public."User" USING btree ("dailyShoutOuts");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_isOnline_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "User_isOnline_idx" ON public."User" USING btree ("isOnline");


--
-- Name: User_lastLoginAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "User_lastLoginAt_idx" ON public."User" USING btree ("lastLoginAt");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: VerificationCountry_isEnabled_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "VerificationCountry_isEnabled_idx" ON public."VerificationCountry" USING btree ("isEnabled");


--
-- Name: VerificationCountry_name_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "VerificationCountry_name_idx" ON public."VerificationCountry" USING btree (name);


--
-- Name: VerificationRequest_listingId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "VerificationRequest_listingId_idx" ON public."VerificationRequest" USING btree ("listingId");


--
-- Name: VerificationRequest_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "VerificationRequest_status_idx" ON public."VerificationRequest" USING btree (status);


--
-- Name: VerificationRequest_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "VerificationRequest_userId_idx" ON public."VerificationRequest" USING btree ("userId");


--
-- Name: Visitor_countryCode_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Visitor_countryCode_idx" ON public."Visitor" USING btree ("countryCode");


--
-- Name: Visitor_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Visitor_createdAt_idx" ON public."Visitor" USING btree ("createdAt");


--
-- Name: Visitor_isSelfView_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Visitor_isSelfView_idx" ON public."Visitor" USING btree ("isSelfView");


--
-- Name: Visitor_productId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Visitor_productId_idx" ON public."Visitor" USING btree ("productId");


--
-- Name: Visitor_sellerId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "Visitor_sellerId_idx" ON public."Visitor" USING btree ("sellerId");


--
-- Name: WalletTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WalletTransaction_createdAt_idx" ON public."WalletTransaction" USING btree ("createdAt");


--
-- Name: WalletTransaction_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WalletTransaction_status_idx" ON public."WalletTransaction" USING btree (status);


--
-- Name: WalletTransaction_type_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WalletTransaction_type_idx" ON public."WalletTransaction" USING btree (type);


--
-- Name: WalletTransaction_walletId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WalletTransaction_walletId_idx" ON public."WalletTransaction" USING btree ("walletId");


--
-- Name: Wallet_userId_key; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");


--
-- Name: WithdrawalRequest_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WithdrawalRequest_createdAt_idx" ON public."WithdrawalRequest" USING btree ("createdAt");


--
-- Name: WithdrawalRequest_status_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WithdrawalRequest_status_idx" ON public."WithdrawalRequest" USING btree (status);


--
-- Name: WithdrawalRequest_userId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WithdrawalRequest_userId_idx" ON public."WithdrawalRequest" USING btree ("userId");


--
-- Name: WorldChatMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WorldChatMessage_createdAt_idx" ON public."WorldChatMessage" USING btree ("createdAt");


--
-- Name: WorldChatMessage_senderId_idx; Type: INDEX; Schema: public; Owner: expo_dev
--

CREATE INDEX "WorldChatMessage_senderId_idx" ON public."WorldChatMessage" USING btree ("senderId");


--
-- Name: AIAgentAuditLog AIAgentAuditLog_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIAgentAuditLog"
    ADD CONSTRAINT "AIAgentAuditLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public."AIAgent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AIAuditLog AIAuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIAuditLog"
    ADD CONSTRAINT "AIAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AIPermission AIPermission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AIPermission"
    ADD CONSTRAINT "AIPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: APIKey APIKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."APIKey"
    ADD CONSTRAINT "APIKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: APIUsageLog APIUsageLog_apiKeyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."APIUsageLog"
    ADD CONSTRAINT "APIUsageLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES public."APIKey"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: APIUsageLog APIUsageLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."APIUsageLog"
    ADD CONSTRAINT "APIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuctionBid AuctionBid_bidderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionBid"
    ADD CONSTRAINT "AuctionBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuctionBid AuctionBid_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionBid"
    ADD CONSTRAINT "AuctionBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."AuctionListing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuctionListing AuctionListing_digitalVoucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionListing"
    ADD CONSTRAINT "AuctionListing_digitalVoucherId_fkey" FOREIGN KEY ("digitalVoucherId") REFERENCES public."DigitalVoucher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuctionListing AuctionListing_posterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionListing"
    ADD CONSTRAINT "AuctionListing_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuctionListing AuctionListing_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionListing"
    ADD CONSTRAINT "AuctionListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuctionListing AuctionListing_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."AuctionListing"
    ADD CONSTRAINT "AuctionListing_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BlogComment BlogComment_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public."Blog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogComment BlogComment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."BlogComment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BlogComment BlogComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogComment"
    ADD CONSTRAINT "BlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogLike BlogLike_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogLike"
    ADD CONSTRAINT "BlogLike_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public."Blog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogLike BlogLike_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogLike"
    ADD CONSTRAINT "BlogLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."BlogComment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BlogLike BlogLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BlogLike"
    ADD CONSTRAINT "BlogLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Blog Blog_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BoothCustomization BoothCustomization_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BoothCustomization"
    ADD CONSTRAINT "BoothCustomization_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BoothView BoothView_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BoothView"
    ADD CONSTRAINT "BoothView_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BoothView BoothView_viewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BoothView"
    ADD CONSTRAINT "BoothView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Booth Booth_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Booth"
    ADD CONSTRAINT "Booth_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BrochureDownload BrochureDownload_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."BrochureDownload"
    ADD CONSTRAINT "BrochureDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContactView ContactView_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ContactView"
    ADD CONSTRAINT "ContactView_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContactView ContactView_viewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ContactView"
    ADD CONSTRAINT "ContactView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DigitalVoucherTransaction DigitalVoucherTransaction_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."DigitalVoucherTransaction"
    ADD CONSTRAINT "DigitalVoucherTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DigitalVoucherTransaction DigitalVoucherTransaction_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."DigitalVoucherTransaction"
    ADD CONSTRAINT "DigitalVoucherTransaction_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."DigitalVoucher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DigitalVoucher DigitalVoucher_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."DigitalVoucher"
    ADD CONSTRAINT "DigitalVoucher_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GoodsVerificationRecord GoodsVerificationRecord_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."GoodsVerificationRecord"
    ADD CONSTRAINT "GoodsVerificationRecord_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."DigitalVoucher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Inquiry Inquiry_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inquiry Inquiry_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Inquiry Inquiry_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Inquiry"
    ADD CONSTRAINT "Inquiry_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LogisticsUpdate LogisticsUpdate_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."LogisticsUpdate"
    ADD CONSTRAINT "LogisticsUpdate_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."DigitalVoucher"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MarketplaceTask MarketplaceTask_postedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."MarketplaceTask"
    ADD CONSTRAINT "MarketplaceTask_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notice Notice_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Notice"
    ADD CONSTRAINT "Notice_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentProof PaymentProof_sellerProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PaymentProof"
    ADD CONSTRAINT "PaymentProof_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PaymentProof PaymentProof_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PaymentProof"
    ADD CONSTRAINT "PaymentProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrivateMessage PrivateMessage_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PrivateMessage"
    ADD CONSTRAINT "PrivateMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrivateMessage PrivateMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PrivateMessage"
    ADD CONSTRAINT "PrivateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductBrochure ProductBrochure_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ProductBrochure"
    ADD CONSTRAINT "ProductBrochure_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_boothId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES public."Booth"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_minOrderUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_minOrderUnitId_fkey" FOREIGN KEY ("minOrderUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_supplyCapacityUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_supplyCapacityUnitId_fkey" FOREIGN KEY ("supplyCapacityUnitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PublicMessage PublicMessage_linkedSellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PublicMessage"
    ADD CONSTRAINT "PublicMessage_linkedSellerId_fkey" FOREIGN KEY ("linkedSellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PublicMessage PublicMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."PublicMessage"
    ADD CONSTRAINT "PublicMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewHelpfulVote ReviewHelpfulVote_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ReviewHelpfulVote"
    ADD CONSTRAINT "ReviewHelpfulVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Review"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewHelpfulVote ReviewHelpfulVote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ReviewHelpfulVote"
    ADD CONSTRAINT "ReviewHelpfulVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerProfile SellerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."SellerProfile"
    ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerVerificationFile SellerVerificationFile_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."SellerVerificationFile"
    ADD CONSTRAINT "SellerVerificationFile_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShoutOut ShoutOut_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."ShoutOut"
    ADD CONSTRAINT "ShoutOut_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoreBrochure StoreBrochure_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."StoreBrochure"
    ADD CONSTRAINT "StoreBrochure_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskApplication TaskApplication_applicantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskApplication"
    ADD CONSTRAINT "TaskApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TaskApplication TaskApplication_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskApplication"
    ADD CONSTRAINT "TaskApplication_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."MarketplaceTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskDeliverable TaskDeliverable_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskDeliverable"
    ADD CONSTRAINT "TaskDeliverable_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."MarketplaceTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskEscrow TaskEscrow_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskEscrow"
    ADD CONSTRAINT "TaskEscrow_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."MarketplaceTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskMilestone TaskMilestone_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TaskMilestone"
    ADD CONSTRAINT "TaskMilestone_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."MarketplaceTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TopicComment TopicComment_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicComment"
    ADD CONSTRAINT "TopicComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."TopicComment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TopicComment TopicComment_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicComment"
    ADD CONSTRAINT "TopicComment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TopicComment TopicComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicComment"
    ADD CONSTRAINT "TopicComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TopicLike TopicLike_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicLike"
    ADD CONSTRAINT "TopicLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."TopicComment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TopicLike TopicLike_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicLike"
    ADD CONSTRAINT "TopicLike_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TopicLike TopicLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."TopicLike"
    ADD CONSTRAINT "TopicLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Topic Topic_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VerificationRequest VerificationRequest_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."VerificationRequest"
    ADD CONSTRAINT "VerificationRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."AuctionListing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VerificationRequest VerificationRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."VerificationRequest"
    ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Visitor Visitor_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Visitor"
    ADD CONSTRAINT "Visitor_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visitor Visitor_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Visitor"
    ADD CONSTRAINT "Visitor_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."SellerProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Visitor Visitor_viewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Visitor"
    ADD CONSTRAINT "Visitor_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WalletTransaction WalletTransaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallet Wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WithdrawalRequest WithdrawalRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."WithdrawalRequest"
    ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorldChatMessage WorldChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: expo_dev
--

ALTER TABLE ONLY public."WorldChatMessage"
    ADD CONSTRAINT "WorldChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: expo_dev
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict PEEd6WnkuWQU5SmQc02PxjzRuOvcPwEe5dyDQGMDmywGJW4BJmEcirjAzn0Qv47

