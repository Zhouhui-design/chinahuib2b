import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'

export default async function TestUploadPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/test-upload')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload Test</h1>
          <p className="text-gray-600 mb-8">
            Test the DigitalOcean Spaces integration. Note: You need to configure your 
            DigitalOcean Spaces credentials in .env.local first.
          </p>

          <div className="space-y-8">
            {/* Product Image Upload */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Product Image Upload</h2>
              <FileUpload
                type="product_image"
                productId="test-product-id"
                multiple={true}
                onUploadSuccess={(data) => {
                  console.log('Product image uploaded:', data)
                  alert('Product image uploaded! Check console for details.')
                }}
              />
            </section>

            {/* Logo Upload */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Company Logo Upload</h2>
              <FileUpload
                type="logo"
                onUploadSuccess={(data) => {
                  console.log('Logo uploaded:', data)
                  alert('Logo uploaded! Check console for details.')
                }}
              />
            </section>

            {/* Banner Upload */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Store Banner Upload</h2>
              <FileUpload
                type="banner"
                onUploadSuccess={(data) => {
                  console.log('Banner uploaded:', data)
                  alert('Banner uploaded! Check console for details.')
                }}
              />
            </section>

            {/* Brochure Upload */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Product Brochure Upload (PDF)</h2>
              <FileUpload
                type="brochure"
                productId="test-product-id"
                title="Product Catalog 2024"
                onUploadSuccess={(data) => {
                  console.log('Brochure uploaded:', data)
                  alert('Brochure uploaded! Check console for details.')
                }}
              />
            </section>
          </div>

          {/* Configuration Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚙️ Configuration Required</h3>
            <p className="text-sm text-yellow-800 mb-2">
              To use file upload, you need to set up DigitalOcean Spaces and add these variables to your .env.local:
            </p>
            <pre className="text-xs bg-yellow-100 p-3 rounded overflow-x-auto">
{`SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_ACCESS_KEY=your_access_key
SPACES_SECRET_KEY=your_secret_key
SPACES_BUCKET=chinahuib2b
SPACES_REGION=nyc3`}
            </pre>
            <p className="text-xs text-yellow-700 mt-2">
              Without proper configuration, uploads will fail. The system is ready - just add your credentials!
            </p>
          </div>

          {/* Features List */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">✨ Features Implemented</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✅ Automatic image optimization (converts to WebP)</li>
              <li>✅ File size validation (5MB for images, 20MB for PDFs)</li>
              <li>✅ File type validation</li>
              <li>✅ Progress indicator during upload</li>
              <li>✅ Error handling with user-friendly messages</li>
              <li>✅ Success notifications</li>
              <li>✅ Multiple file upload support</li>
              <li>✅ Automatic database record creation</li>
              <li>✅ Seller-only access control</li>
              <li>✅ Public URL generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
