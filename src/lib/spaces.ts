import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
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
 *
 * @param fileBuffer File buffer to upload
 * @param finalName The final, processed filename (e.g. "abcd1234.webp") —
 *        should NOT be the user's original upload name if the file was
 *        reformatted/resized (sharp WebP conversion, etc).
 * @param mimeType Final MIME type of the processed file (e.g. "image/webp")
 * @param subDir Target subdirectory (e.g. "products", "logos")
 */
export async function uploadToSpaces(
  fileBuffer: Buffer,
  finalName: string,
  mimeType: string,
  subDir: string = 'uploads'
): Promise<UploadResult> {
  try {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    // Use the processed filename to preserve the correct extension
    const ext = finalName.includes('.') ? finalName.split('.').pop() || 'bin' : 'bin'
    const baseName = finalName.includes('.') ? finalName.slice(0, -(ext.length + 1)) : finalName
    const key = `${subDir}/${timestamp}-${randomString}-${baseName}.${ext}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Make files publicly accessible
    })

    await s3Client.send(command)

    // Generate public URL
    const baseUrl = process.env.DO_SPACES_ENDPOINT?.replace('https://', `https://${BUCKET_NAME}.`)
      || `https://${BUCKET_NAME}.sgp1.digitaloceanspaces.com`

    const url = `${baseUrl}/${key}`

    return {
      url,
      key,
      fileName: finalName,
      size: fileBuffer.length,
    }
  } catch (error) {
    console.error('DigitalOcean Spaces upload error:', error)
    throw new Error('Failed to upload to cloud storage')
  }
}

/**
 * Delete an object from DigitalOcean Spaces by its URL
 * @param url Public CDN URL of the object (e.g. https://bucket.sgp1..../key)
 */
export async function deleteFromSpacesByUrl(url: string): Promise<void> {
  try {
    if (!isSpacesConfigured()) return
    // Extract key from URL: https://bucket.region.digitaloceanspaces.com/key -> key
    const match = url.match(/\/([^/]+\/[^/]+\/.*)$/)
    if (!match) return
    const key = match[1]
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }))
  } catch (error) {
    console.error('Delete from Spaces error:', error)
  }
}

/**
 * Verify a Spaces object exists (useful for health checks)
 */
export async function verifySpacesObjectExists(key: string): Promise<boolean> {
  try {
    if (!isSpacesConfigured()) return false
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }))
    return true
  } catch {
    return false
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
 * Check if Spaces is configured (access key + secret key + bucket)
 */
export function isSpacesConfigured(): boolean {
  return !!(
    process.env.DO_SPACES_ACCESS_KEY &&
    process.env.DO_SPACES_SECRET_KEY &&
    process.env.DO_SPACES_BUCKET &&
    process.env.DO_SPACES_ACCESS_KEY.trim().length > 0 &&
    process.env.DO_SPACES_SECRET_KEY.trim().length > 0
  )
}
