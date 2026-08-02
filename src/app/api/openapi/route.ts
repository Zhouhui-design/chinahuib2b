import { NextResponse } from 'next/server'

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'SeaHeart Global API - B2B Exhibition Platform',
      version: '1.0.0',
      description: 'Public API for searching exhibitions, products, suppliers, and categories on SeaHeart Global - The Global B2B Online Exhibition Platform',
      contact: {
        name: 'SeaHeart Global Support',
        email: 'contact@x2xhub.com',
        url: 'https://x2xhub.com',
      },
      'x-logo': {
        url: 'https://x2xhub.com/logo.png',
        altText: 'SeaHeart Global Logo',
      },
    },
    servers: [
      {
        url: 'https://x2xhub.com',
        description: 'Production',
      },
    ],
    paths: {
      '/api/exhibitions': {
        get: {
          summary: 'List all exhibitions',
          description: 'Retrieve all upcoming and ongoing B2B exhibitions with their booths and suppliers',
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['upcoming', 'ongoing', 'ended'] },
              description: 'Filter by exhibition status',
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by industry category',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
          ],
          responses: {
            '200': {
              description: 'List of exhibitions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      exhibitions: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Exhibition' },
                      },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/exhibitions/{id}': {
        get: {
          summary: 'Get exhibition details',
          description: 'Get complete exhibition details including all booths and their suppliers',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Exhibition details with booths',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Exhibition' },
                      {
                        type: 'object',
                        properties: {
                          booths: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Booth' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Exhibition not found',
            },
          },
        },
      },
      '/api/booths/{id}': {
        get: {
          summary: 'Get booth/supplier details',
          description: 'Get detailed information about a booth including supplier profile, products, and documents',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Booth details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Booth' },
                },
              },
            },
          },
        },
      },
      '/api/products': {
        get: {
          summary: 'List products',
          description: 'Search and browse products from verified suppliers worldwide',
          parameters: [
            {
              name: 'q',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search query text',
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by category',
            },
            {
              name: 'country',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by supplier country',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
          ],
          responses: {
            '200': {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' },
                      },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/products/search': {
        get: {
          summary: 'Search products',
          description: 'Advanced product search with full-text search and filtering',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Search query',
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'minPrice',
              in: 'query',
              schema: { type: 'number' },
            },
            {
              name: 'maxPrice',
              in: 'query',
              schema: { type: 'number' },
            },
            {
              name: 'verified',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Only show verified suppliers',
            },
          ],
          responses: {
            '200': {
              description: 'Search results',
            },
          },
        },
      },
      '/api/stores/{id}': {
        get: {
          summary: 'Get supplier/store details',
          description: 'Get detailed supplier/store information including products and certifications',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Supplier details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Supplier' },
                },
              },
            },
          },
        },
      },
      '/api/sellers': {
        get: {
          summary: 'List suppliers',
          description: 'Browse verified suppliers/manufacturers',
          parameters: [
            {
              name: 'country',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'verified',
              in: 'query',
              schema: { type: 'boolean' },
            },
          ],
          responses: {
            '200': {
              description: 'List of suppliers',
            },
          },
        },
      },
      '/api/categories': {
        get: {
          summary: 'List categories',
          description: 'Get all product categories and industries available on the platform',
          responses: {
            '200': {
              description: 'List of categories',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/categories/tree': {
        get: {
          summary: 'Get category tree',
          description: 'Get hierarchical category structure',
          responses: {
            '200': {
              description: 'Category tree',
            },
          },
        },
      },
      '/api/public/booths': {
        get: {
          summary: 'List public booths',
          description: 'Get all published/visible booths for public display',
          responses: {
            '200': {
              description: 'List of public booths',
            },
          },
        },
      },
      '/api/sellers/public': {
        get: {
          summary: 'List public suppliers',
          description: 'Get all publicly visible suppliers',
          responses: {
            '200': {
              description: 'List of public suppliers',
            },
          },
        },
      },
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'API health check endpoint',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Exhibition: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['upcoming', 'ongoing', 'ended'] },
            location: { type: 'string' },
            category: { type: 'string' },
            bannerUrl: { type: 'string', format: 'uri' },
            boothCount: { type: 'integer' },
          },
        },
        Booth: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            boothNumber: { type: 'string' },
            name: { type: 'string' },
            exhibitionName: { type: 'string' },
            location: { type: 'string' },
            logoUrl: { type: 'string', format: 'uri' },
            bannerUrl: { type: 'string', format: 'uri' },
            seller: { $ref: '#/components/schemas/Supplier' },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  url: { type: 'string', format: 'uri' },
                  type: { type: 'string' },
                  size: { type: 'integer' },
                },
              },
            },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            companyName: { type: 'string' },
            description: { type: 'string' },
            logoUrl: { type: 'string', format: 'uri' },
            website: { type: 'string', format: 'uri' },
            email: { type: 'string', format: 'email' },
            country: { type: 'string' },
            isVerified: { type: 'boolean' },
            verificationStatus: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
            },
            yearsInBusiness: { type: 'integer' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            currency: { type: 'string' },
            category: { type: 'string' },
            images: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
            },
            sellerId: { type: 'string' },
            seller: { $ref: '#/components/schemas/Supplier' },
            specifications: { type: 'object' },
            minOrderQuantity: { type: 'integer' },
            rating: { type: 'number' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            nameEn: { type: 'string' },
            parentId: { type: 'string', nullable: true },
            children: {
              type: 'array',
              items: { $ref: '#/components/schemas/Category' },
            },
            productCount: { type: 'integer' },
          },
        },
      },
    },
    'x-internal': {
      'x-logo': {
        url: 'https://x2xhub.com/logo.png',
      },
    },
  }

  return NextResponse.json(openApiSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
