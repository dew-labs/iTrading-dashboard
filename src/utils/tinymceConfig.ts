/**
 * TinyMCE Configuration Utilities
 * Ensures proper cloud storage upload and prevents local storage issues
 */

export interface TinyMCEUploadConfig {
  bucket: string
  folder: string
  uploadHandler: (blobInfo: unknown, progress: (percent: number) => void) => Promise<string>
  filePickerCallback: (callback: (url: string, meta?: { alt?: string }) => void, value: string, meta: unknown) => void
}

export const getTinyMCEConfig = (uploadConfig: TinyMCEUploadConfig, height: number = 400) => {
  return {
    height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic underline strikethrough | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | link image | code',
    content_style: `
      body {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
      }
      h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; }
      h2 { font-size: 1.5em; font-weight: 600; margin: 0.75em 0; }
      h3 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; }
      blockquote {
        border-left: 4px solid #d1d5db;
        padding-left: 16px;
        margin: 16px 0;
        font-style: italic;
        color: #6b7280;
        background-color: #f9fafb;
        padding: 12px 16px;
        border-radius: 0 4px 4px 0;
      }
      pre {
        background-color: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        margin: 12px 0;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        overflow-x: auto;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 12px 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      a {
        color: #3b82f6;
        text-decoration: underline;
      }
      a:hover {
        color: #1d4ed8;
      }
    `,
    skin: 'oxide',
    content_css: 'default',
    branding: false,
    promotion: false,
    resize: false,
    statusbar: false,
    // Image upload configuration - ensure cloud storage
    images_upload_handler: uploadConfig.uploadHandler,
    file_picker_callback: uploadConfig.filePickerCallback,
    file_picker_types: 'image',
    automatic_uploads: true, // Force automatic uploads to cloud storage
    images_reuse_filename: false, // Always generate new filenames
    // Paste configuration - ensure images are uploaded, not embedded as base64
    paste_data_images: true,
    paste_as_text: false,
    paste_preprocess: (plugin: unknown, args: { content: string }) => {
      // Remove any base64 images that might slip through
      args.content = args.content.replace(/<img[^>]*src="data:image[^"]*"[^>]*>/gi, '')
    },
    // Link configuration
    link_default_target: '_blank',
    link_default_protocol: 'https',
    // Other configurations to prevent local storage
    entity_encoding: 'raw' as const,
    extended_valid_elements: 'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
    valid_children: '+body[style],+div[div|p|br|span|img|strong|em|a|ul|ol|li|h1|h2|h3|h4|h5|h6|blockquote|pre|code]',
    // Cache settings
    cache_suffix: '?v=' + new Date().getTime(), // Prevent caching issues
    // Force cloud storage for all images
    convert_urls: false, // Don't convert relative URLs
    relative_urls: false // Use absolute URLs for images
  }
}

export const STORAGE_BUCKETS = {
  POSTS: 'posts',
  BROKERS: 'brokers',
  PRODUCTS: 'products',
  BANNERS: 'banners',
  IMAGES: 'images'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]
