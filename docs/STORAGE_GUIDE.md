# 📁 Storage Configuration Guide

This guide explains how image storage works in the iTrading Dashboard, particularly for TinyMCE editor uploads.

## 🎯 Overview

All images uploaded through TinyMCE editors are now stored in **Supabase Cloud Storage** using dedicated buckets for different content types. This ensures:

- ✅ **No local storage issues** - All images go directly to cloud storage
- ✅ **Organized storage** - Each content type has its own bucket
- ✅ **Proper URLs** - Images get permanent, shareable URLs
- ✅ **Automatic uploads** - No manual intervention needed

## 📦 Storage Buckets

| Bucket     | Used For                  | Folder Structure   |
| ---------- | ------------------------- | ------------------ |
| `posts`    | Blog posts, news articles | `posts/images/`    |
| `brokers`  | Broker descriptions       | `brokers/images/`  |
| `products` | Product descriptions      | `products/images/` |
| `banners`  | Banner images             | `banners/images/`  |
| `images`   | General/shared images     | `images/`          |

## 🔧 How It Works

### TinyMCE Editor Integration

When you upload an image in any TinyMCE editor:

1. **Image Selection**: User drops/selects an image file
2. **Validation**: File type and size are checked
3. **Cloud Upload**: Image is uploaded to appropriate Supabase bucket
4. **URL Generation**: Permanent public URL is generated
5. **Editor Insertion**: URL is inserted into the editor content

### Form-Specific Buckets

Each form uses its designated bucket:

```typescript
// ProductForm.tsx
<RichTextEditor
  bucket="products"
  folder="images"
  // ...other props
/>

// BrokerForm.tsx
<RichTextEditor
  bucket="brokers"
  folder="images"
  // ...other props
/>

// PostForm.tsx
<RichTextEditor
  bucket="posts"
  folder="images"
  // ...other props
/>
```

## 🛠️ Configuration

### TinyMCE Settings

The editor is configured to:

- ✅ Force automatic uploads (`automatic_uploads: true`)
- ✅ Prevent local caching (`images_reuse_filename: false`)
- ✅ Use absolute URLs (`relative_urls: false`)
- ✅ Strip base64 images from paste operations
- ✅ Generate unique filenames for each upload

### Storage Policies

Each bucket has RLS (Row Level Security) policies:

- **INSERT**: Authenticated users can upload
- **SELECT**: Public read access for all images
- **UPDATE/DELETE**: Authenticated users can manage their uploads

## 🔍 Troubleshooting

### Images Not Uploading

1. **Check Authentication**: Ensure user is logged in
2. **File Size**: Maximum 10MB per image
3. **File Type**: Only JPEG, PNG, GIF, WebP allowed
4. **Network**: Check internet connection

### Images Showing as Local

If you see `data:image` URLs instead of cloud URLs:

1. Images are being cached locally instead of uploaded
2. Check TinyMCE configuration has `automatic_uploads: true`
3. Verify upload handlers are properly configured

### Permission Issues

If uploads fail with permission errors:

1. Check Supabase authentication status
2. Verify RLS policies are correctly applied
3. Ensure bucket exists and is publicly readable

## 📊 Monitoring Storage

### CLI Commands

```bash
# List all buckets
npx supabase storage --experimental ls --linked

# List files in a bucket
npx supabase storage --experimental ls ss:///posts --recursive --linked

# Check specific bucket contents
npx supabase storage --experimental ls ss:///brokers --recursive --linked
```

### Storage Usage

Each bucket is configured with:

- **Size Limit**: 10MB per file
- **Public Access**: Yes (for image serving)
- **MIME Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

## 🎨 Example URLs

Uploaded images get URLs like:

```
https://your-project.supabase.co/storage/v1/object/public/products/images/1750961998975-n65d09wsga.png
https://your-project.supabase.co/storage/v1/object/public/brokers/images/1750963334377-mppd2kttzx.png
```

## 🧰 Development

### Testing Storage

Run the test script to verify all buckets are properly configured:

```bash
node scripts/test-storage.js
```

### Adding New Buckets

1. Create migration file in `supabase/migrations/`
2. Add bucket creation SQL
3. Set up RLS policies
4. Update `STORAGE_BUCKETS` constant in `src/utils/tinymceConfig.ts`
5. Run migration: `npx supabase db push --linked`

## 🔒 Security

- All uploads require authentication
- Public read access for serving images
- File type validation prevents malicious uploads
- Size limits prevent abuse
- Unique filenames prevent conflicts

## 📈 Best Practices

1. **Use Appropriate Buckets**: Don't mix content types
2. **Optimize Images**: Compress before upload when possible
3. **Clean URLs**: The system generates clean, permanent URLs
4. **Monitor Usage**: Keep track of storage consumption
5. **Regular Cleanup**: Remove unused images periodically
