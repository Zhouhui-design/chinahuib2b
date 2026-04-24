# Global Expo Network (chinahuib2b.top)

A B2B exhibition-style e-commerce platform that simulates offline trade shows. Built with Next.js 14, PostgreSQL, and integrated chat system.

## 🚀 Features Implemented

### ✅ Core Infrastructure
- Next.js 14 with TypeScript and App Router
- PostgreSQL database with Prisma ORM
- Redis for caching (ready for implementation)
- Authentication system with NextAuth v5
- User registration and login pages

### ✅ Database Schema
- Users (Buyers & Sellers)
- Seller Profiles with subscription management
- Product Categories (3-level hierarchy)
- Products (exhibition items - NO PRICES)
- Product & Store Brochures (PDF downloads)
- Inquiries system
- Contact view tracking ("business card collection")
- Brochure download tracking

### ✅ Authentication
- Email/password registration
- Role-based access (BUYER/SELLER)
- Account activity monitoring (365-day inactivity policy)
- Protected routes via middleware
- Automatic seller profile creation on registration

### ✅ UI Components
- Exhibition-style home page with category navigation
- Product cards with hover effects
- Responsive layout with Tailwind CSS
- Exhibition hall metaphor (zones, exhibits, exhibitors)

## 📋 What's Ready to Use

1. **User Registration**: `/auth/register`
   - Create buyer or seller accounts
   - Automatic seller profile with 30-day free trial
   
2. **User Login**: `/auth/login`
   - Secure authentication
   - Session management
   - Last login tracking

3. **Home Page**: `/`
   - Exhibition hall layout
   - Category navigation sidebar
   - Featured products grid
   - Responsive design

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7

### Installation

1. **Install dependencies** (already done):
```bash
npm install
```

2. **Database is set up**:
   - PostgreSQL running on localhost:5432
   - Database: `global_expo_dev`
   - User: `expo_dev` / Password: `dev123`
   - Migrations applied

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Visit http://localhost:3000

## 📁 Project Structure

```
chinahuib2b/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/            # Public pages
│   │   │   └── page.tsx       # Home page
│   │   └── api/
│   │       ├── auth/          # NextAuth routes
│   │       └── register/      # Registration API
│   ├── components/
│   │   └── exhibition/        # Exhibition components
│   │       └── ProductCard.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client
│   │   └── redis.ts           # Redis client
│   ├── types/
│   │   └── next-auth.d.ts     # Type extensions
│   └── middleware.ts          # Route protection
└── .env.local                 # Environment variables
```

## 🔑 Key Business Rules

1. **NO PRICE DISPLAY**: Products never show prices anywhere
2. **Contact Visibility**: Only logged-in users can see seller contact info
3. **Account Activity**: Accounts inactive for 365 days are deactivated
4. **Subscription**: Sellers pay $10/month (free 30-day trial)
5. **Brochure Downloads**: Available to guests (no login required)
6. **Chat Integration**: Ready to connect with existing chat system

## 🚧 What Needs to Be Completed

The following features are planned but not yet implemented:

### High Priority
- [ ] Product CRUD APIs and pages
- [ ] Product detail page with image gallery
- [ ] Store/exhibitor pages
- [ ] File upload to DigitalOcean Spaces
- [ ] Chat widget integration
- [ ] Product list page with filters
- [ ] Seller dashboard

### Medium Priority
- [ ] Brochure download tracking
- [ ] Contact view API ("collect business card")
- [ ] Inquiry system
- [ ] Subscription payment integration (Stripe)
- [ ] Account cleanup cron job
- [ ] Seed data script

### Low Priority
- [ ] Multi-language support (i18n)
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Mobile app optimization

## 🌐 Deployment to DigitalOcean

See the detailed deployment guide in the plan document. Quick steps:

1. Push code to Git repository
2. SSH to DigitalOcean server
3. Pull latest code
4. Run migrations: `npx prisma migrate deploy`
5. Build: `npm run build`
6. Restart PM2: `pm2 restart nextjs-app`

## 📝 Testing the Platform

### Test User Flow

1. **Register as Buyer**:
   - Go to http://localhost:3000/auth/register
   - Fill form, select "Buyer"
   - Login at `/auth/login`

2. **Register as Seller**:
   - Register with "Seller" role
   - Gets 30-day free trial automatically
   - Can add products (dashboard pending)

3. **Browse Products**:
   - Visit home page
   - Browse by category
   - Click "View Exhibit" to see details

## 🔗 Integration Points

### Chat System
Location: `/home/sardenesy/.openclaw/workspace/chat-system`

To integrate:
1. Ensure chat system is running on port 5001
2. JWT secrets must match between systems
3. Use WebSocket connection with user token
4. Create conversation via REST API before opening chat

### DigitalOcean Spaces
For file storage (brochures, images):
- Configure credentials in `.env.local`
- Use S3-compatible API
- Files stored in `global-expo-storage` bucket

## 🎨 Design Philosophy

**Exhibition Hall Metaphor**:
- Home = Exhibition hall entrance
- Categories = Exhibition zones
- Products = Exhibits on display
- Stores = Individual booths
- Contact info = Business cards (login to collect)
- Brochures = Product catalogs (free to download)

**Visual Style**:
- Clean, professional (beige/gray tones)
- Card-based layouts
- Hover effects simulate "walking closer to exhibit"
- No clutter, focus on products

## 📞 Support

For issues or questions:
- Check the plan document for detailed specifications
- Review Prisma schema for data model
- Examine component code for implementation details

## 📄 License

Proprietary - Global Expo Network

---

**Status**: MVP Foundation Complete  
**Next Steps**: Implement product management, file uploads, and chat integration  
**Target Launch**: chinahuib2b.top
