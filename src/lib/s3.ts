import { S3Client } from '@aws-sdk/client-s3'

// DigitalOcean Spaces configuration
const spacesEndpoint = process.env.SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com'
const spacesAccessKey = process.env.SPACES_ACCESS_KEY || ''
const spacesSecretKey = process.env.SPACES_SECRET_KEY || ''
const spacesBucket = process.env.SPACES_BUCKET || 'chinahuib2b'
const spacesRegion = process.env.SPACES_REGION || 'nyc3'

export const s3Client = new S3Client({
  region: spacesRegion,
  endpoint: spacesEndpoint,
  credentials: {
    accessKeyId: spacesAccessKey,
    secretAccessKey: spacesSecretKey,
  },
})

export { spacesBucket, spacesEndpoint }

// Generate public URL for uploaded file
export function getPublicUrl(key: string): string {
  return `${spacesEndpoint}/${spacesBucket}/${key}`
}

// Validate file type
export function validateFileType(mimetype: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.split('/')[0]
      return mimetype.startsWith(prefix + '/')
    }
    return mimetype === type
  })
}

// File size limits (in bytes)
export const FILE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  PDF: 20 * 1024 * 1024,  // 20MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
}
