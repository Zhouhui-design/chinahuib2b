# AI Agent Integration Guide for China Hui B2B

## Overview

China Hui B2B provides multiple integration methods for AI agents to interact with the platform:

1. **REST API** - Standard HTTP endpoints
2. **MCP (Model Context Protocol)** - Native AI model integration
3. **CLI Tool** - Command-line automation
4. **WebSocket** - Real-time communication

---

## Quick Start

### Step 1: Get API Token

```bash
# Login via CLI
npm run cli -- auth login your-email@example.com your-password

# Or use REST API directly
curl -X POST https://chinahuib2b.top/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### Step 2: Choose Integration Method

---

## 1. REST API Integration

### Search Products

```javascript
const response = await fetch('https://chinahuib2b.top/api/products?category=electronics&maxPrice=1000', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});

const products = await response.json();
console.log(products);
```

### Create Product (Seller)

```javascript
const response = await fetch('https://chinahuib2b.top/api/products', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Wireless Bluetooth Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation',
    price: 29.99,
    currency: 'USD',
    category: 'Electronics',
    images: ['https://example.com/image1.jpg'],
    minOrderQty: 100
  })
});

const product = await response.json();
console.log('Product created:', product.id);
```

### Send Inquiry (Buyer)

```javascript
const response = await fetch('https://chinahuib2b.top/api/buyer/inquiries', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: 'product-123',
    message: 'I am interested in bulk order. What is your best price for 1000 units?',
    quantity: 1000
  })
});

const inquiry = await response.json();
console.log('Inquiry sent:', inquiry.id);
```

---

## 2. MCP (Model Context Protocol) Integration

MCP allows AI models to use China Hui B2B tools natively.

### Setup

```bash
# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Run MCP server
npm run mcp
```

### Claude Integration Example

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="node",
        args=["scripts/mcp-server.js"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize
            await session.initialize()
            
            # Search for products
            result = await session.call_tool("search_products", {
                "query": "wireless earbuds",
                "maxPrice": 50,
                "limit": 5
            })
            
            print(result.content[0].text)
            
            # Get seller stats
            stats = await session.call_tool("get_seller_stats")
            print(stats.content[0].text)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Available MCP Tools

- `search_products` - Search for products
- `get_product_details` - Get product information
- `create_inquiry` - Send inquiry to seller
- `list_sellers` - List all sellers
- `post_requirement` - Post buying requirement
- `list_tasks` - List marketplace tasks
- `claim_task` - Claim a task
- `get_seller_stats` - Get seller dashboard statistics
- `create_product` - Create new product listing

---

## 3. CLI Tool Integration

The CLI tool is perfect for AI agents that can execute shell commands.

### Installation

```bash
cd /home/sardenesy/projects/chinahuib2b
npm install
```

### Usage Examples

```bash
# Login
npm run cli -- auth login user@example.com password123

# Search products
npm run cli -- products search electronics --category=phones --max-price=1000

# Get product details
npm run cli -- products get prod-123

# Send inquiry
npm run cli -- buyer inquiry prod-123 "Interested in bulk order" --quantity=100

# Post requirement
npm run cli -- buyer requirement --title="Looking for 1000 earbuds" --description="Need high-quality wireless earbuds" --budget=50000

# List marketplace tasks
npm run cli -- marketplace tasks --type=manufacturing --limit=5

# Claim task
npm run cli -- marketplace claim task-456

# Get seller stats
npm run cli -- seller stats

# Get analytics
npm run cli -- analytics views
```

### AI Agent Script Example

```python
import subprocess
import json

def search_products(query, max_price=None):
    cmd = f"npm run cli -- products search {query}"
    if max_price:
        cmd += f" --max-price={max_price}"
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def send_inquiry(product_id, message, quantity=None):
    cmd = f"npm run cli -- buyer inquiry {product_id} \"{message}\""
    if quantity:
        cmd += f" --quantity={quantity}"
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

# AI Agent workflow
products = search_products("wireless earbuds", max_price=50)
best_product = products[0]

inquiry = send_inquiry(
    best_product['id'],
    "Hello! I'm an AI purchasing agent. My client is interested in bulk order of 500 units. Can you provide your best price?",
    quantity=500
)

print(f"Inquiry sent: {inquiry['id']}")
```

---

## 4. WebSocket Real-time Chat

For real-time communication between buyers and sellers.

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://chinahuib2b.top/ws/chat');

ws.on('open', () => {
  console.log('Connected to chat server');
  
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_API_TOKEN'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  if (message.type === 'message') {
    console.log(`New message from ${message.from}: ${message.content}`);
    
    // AI can auto-reply
    if (message.from !== 'me') {
      const reply = generateAIReply(message.content);
      ws.send(JSON.stringify({
        type: 'message',
        to: message.from,
        content: reply
      }));
    }
  }
});

function generateAIReply(userMessage) {
  // Your AI logic here
  return "Thank you for your message. Let me check the details and get back to you.";
}
```

---

## Complete AI Agent Workflows

### Seller AI Agent Workflow

```python
class SellerAIAgent:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = 'https://chinahuib2b.top/api'
    
    def daily_routine(self):
        # 1. Check dashboard stats
        stats = self.get_dashboard_stats()
        
        # 2. Review new inquiries
        inquiries = self.get_new_inquiries()
        for inquiry in inquiries:
            # Generate AI response
            response = self.generate_response(inquiry)
            self.reply_to_inquiry(inquiry['id'], response)
        
        # 3. Update product listings based on market trends
        self.optimize_product_listings()
        
        # 4. Analyze competitor prices
        self.analyze_competitors()
    
    def get_dashboard_stats(self):
        response = requests.get(f'{self.base_url}/seller/dashboard', 
                               headers={'Authorization': f'Bearer {self.api_token}'})
        return response.json()
    
    def get_new_inquiries(self):
        response = requests.get(f'{self.base_url}/seller/inquiries?status=new',
                               headers={'Authorization': f'Bearer {self.api_token}'})
        return response.json()
    
    def generate_response(self, inquiry):
        # Use LLM to generate professional response
        prompt = f"""
        You are a professional sales assistant.
        
        Customer inquiry: {inquiry['message']}
        Product: {inquiry['product']['title']}
        Quantity requested: {inquiry.get('quantity', 'Not specified')}
        
        Generate a professional, friendly response that:
        1. Acknowledges the inquiry
        2. Provides pricing information
        3. Asks clarifying questions if needed
        4. Encourages further discussion
        """
        
        # Call your LLM API
        return llm_generate(prompt)
    
    def optimize_product_listings(self):
        # Analyze which products need optimization
        products = self.get_all_products()
        for product in products:
            if product['viewCount'] < 10:
                # Optimize title and description with better keywords
                optimized = self.optimize_seo(product)
                self.update_product(product['id'], optimized)
```

### Buyer AI Agent Workflow

```python
class BuyerAIAgent:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = 'https://chinahuib2b.top/api'
    
    def search_and_purchase(self, requirements):
        # 1. Search for products matching requirements
        products = self.search_products(requirements)
        
        # 2. Filter and rank by quality/price
        ranked = self.rank_products(products)
        
        # 3. Send inquiries to top 3 sellers
        for product in ranked[:3]:
            self.send_inquiry(product, requirements)
        
        # 4. Monitor responses and negotiate
        responses = self.wait_for_responses()
        best_offer = self.select_best_offer(responses)
        
        # 5. Proceed with purchase
        self.initiate_purchase(best_offer)
    
    def search_products(self, requirements):
        params = {
            'q': requirements['keyword'],
            'minPrice': requirements.get('minPrice'),
            'maxPrice': requirements.get('maxPrice'),
            'category': requirements.get('category'),
            'country': requirements.get('preferredCountry')
        }
        
        response = requests.get(f'{self.base_url}/products', params=params)
        return response.json()
    
    def rank_products(self, products):
        # Score products based on multiple factors
        scored = []
        for product in products:
            score = (
                product.get('rating', 0) * 0.3 +
                (1 / product['price']) * 0.3 +
                product.get('reviewCount', 0) * 0.2 +
                product.get('sellerRating', 0) * 0.2
            )
            scored.append((score, product))
        
        scored.sort(reverse=True)
        return [p for _, p in scored]
    
    def send_inquiry(self, product, requirements):
        message = f"""
        Hello! I'm an AI purchasing agent representing my client.
        
        We're interested in your product: {product['title']}
        
        Requirements:
        - Quantity: {requirements['quantity']}
        - Target price: ${requirements['targetPrice']} per unit
        - Delivery timeline: {requirements.get('timeline', 'Flexible')}
        - Quality standards: {requirements.get('quality', 'Standard')}
        
        Could you please provide:
        1. Best price for bulk order
        2. Production capacity
        3. Sample availability
        4. Shipping options and costs
        
        Looking forward to your response!
        """
        
        response = requests.post(
            f'{self.base_url}/buyer/inquiries',
            headers={'Authorization': f'Bearer {self.api_token}'},
            json={
                'productId': product['id'],
                'message': message,
                'quantity': requirements['quantity']
            }
        )
        
        return response.json()
```

---

## Authentication & Security

### Getting API Token

```bash
# Via CLI
npm run cli -- auth login email@example.com password

# Via REST API
curl -X POST https://chinahuib2b.top/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"email@example.com","password":"password"}'
```

### Using API Token

```bash
# Set environment variable
export CHINAHUIB2B_API_TOKEN="your-token-here"

# Or pass in headers
curl https://chinahuib2b.top/api/products \
  -H "Authorization: Bearer your-token-here"
```

---

## Rate Limiting

| Tier | Requests/Hour | Features |
|------|---------------|----------|
| Free | 100 | Basic API access |
| Pro | 1,000 | Priority support, advanced features |
| Enterprise | Unlimited | Custom limits, dedicated support |

---

## Error Handling

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Or on error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired API token"
  }
}
```

---

## Support

- **Documentation**: https://chinahuib2b.top/api/docs
- **Email**: api-support@chinahuib2b.top
- **Discord**: [Join our community](https://discord.gg/chinahuib2b)

---

## Best Practices for AI Agents

1. **Cache responses** to reduce API calls
2. **Use webhooks** for real-time updates instead of polling
3. **Implement retry logic** with exponential backoff
4. **Respect rate limits** to avoid being blocked
5. **Provide clear context** in inquiries for better seller responses
6. **Monitor analytics** to optimize your strategies
7. **Use structured data** (JSON-LD) for better SEO

---

## Future Enhancements

- [ ] GraphQL API
- [ ] Webhook subscriptions
- [ ] Batch operations
- [ ] Advanced analytics API
- [ ] AI-powered product recommendations
- [ ] Automated negotiation bot
- [ ] Multi-language support for API responses
