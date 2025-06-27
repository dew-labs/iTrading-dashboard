/**
 * Test script to verify storage buckets are properly configured
 */

const {createClient} = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStorageBuckets() {
  const expectedBuckets = ['posts', 'brokers', 'products', 'banners', 'images']

  try {
    console.log('🔍 Testing storage buckets...')

    const {data: buckets, error} = await supabase.storage.listBuckets()

    if (error) {
      console.error('❌ Error listing buckets:', error.message)
      return
    }

    console.log('📁 Found buckets:', buckets.map(b => b.id).join(', '))

    // Check if all expected buckets exist
    const foundBuckets = buckets.map(b => b.id)
    const missingBuckets = expectedBuckets.filter(bucket => !foundBuckets.includes(bucket))

    if (missingBuckets.length > 0) {
      console.error('❌ Missing buckets:', missingBuckets.join(', '))
    } else {
      console.log('✅ All expected buckets are present!')
    }

    // Test bucket properties
    buckets.forEach(bucket => {
      console.log(`📊 Bucket: ${bucket.id}`)
      console.log(`   - Public: ${bucket.public}`)
      console.log(
        `   - File size limit: ${bucket.file_size_limit ? (bucket.file_size_limit / 1024 / 1024).toFixed(1) + 'MB' : 'No limit'}`,
      )
      console.log(
        `   - Allowed MIME types: ${bucket.allowed_mime_types?.join(', ') || 'All types'}`,
      )
    })
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testStorageBuckets()
