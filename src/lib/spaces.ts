import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  region: 'auto', // DigitalOcean Spaces uses 'auto'
  endpoint: process.env.DO_SPACES_ENDPOINT || 'https://sgp1.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || '',
  },
})

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || 'global-expo-storage'

export interface UploadResult {
  url: string
  key: string
  fileName: string
  size: number
}

/**
 * Upload file to DigitalOcean Spaces
 */
export async function uploadToSpaces(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  subDir: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Generate unique key
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const ext = fileName.split('.').pop() || ''
    const key = `${subDir}/${timestamp}-${randomString}.${ext}`

    // Create put object command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Make files publicly accessible
    })

    // Upload to Spaces
    await s3Client.send(command)

    // Generate public URL
    const baseUrl = process.env.DO_SPACES_ENDPOINT?.replace('https://', `https://${BUCKET_NAME}.`) 
      || `https://${BUCKET_NAME}.sgp1.digitaloceanspaces.com`
    
    const url = `${baseUrl}/${key}`

    return {
      url,
      key,
      fileName,
      size: fileBuffer.length,
    }
  } catch (error) {
    console.error('DigitalOcean Spaces upload error:', error)
    throw new Error('Failed to upload to cloud storage')
  }
}

/**
 * Generate presigned URL for direct upload (optional - for large files)
 */
export async function generatePresignedUrl(
  fileName: string,
  mimeType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const ext = fileName.split('.').pop() || ''
  const key = `uploads/${timestamp}-${randomString}.${ext}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
  return signedUrl
}

/**
 * Check if Spaces is configured
 */
export function isSpacesConfigured(): boolean {
  return !!(
    process.env.DO_SPACES_ACCESS_KEY &&
    process.env.DO_SPACES_SECRET_KEY &&
    process.env.DO_SPACES_BUCKET
  )
}
