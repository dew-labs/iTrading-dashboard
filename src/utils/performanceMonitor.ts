interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'timing' | 'count' | 'gauge'
  tags?: Record<string, string>
}

interface NavigationTiming {
  dns: number
  tcp: number
  tls: number
  ttfb: number // Time to First Byte
  domLoad: number
  onLoad: number
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  public static getInstance (): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private constructor () {
    this.setupObservers()
    this.trackNavigationTiming()
  }

  private setupObservers (): void {
    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcpEntry = entries[entries.length - 1] // Get the latest LCP
          if (lcpEntry) {
            this.recordMetric('lcp', lcpEntry.startTime, 'timing', { type: 'core-web-vital' })
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number } // Type assertion for FID entry
            if (fidEntry.processingStart && fidEntry.startTime) {
              this.recordMetric('fid', fidEntry.processingStart - fidEntry.startTime, 'timing', {
                type: 'core-web-vital'
              })
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)

        // CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          list.getEntries().forEach((entry) => {
            const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number } // Type assertion for CLS entry
            if (!clsEntry.hadRecentInput && clsEntry.value !== undefined) {
              clsValue += clsEntry.value
            }
          })
          if (clsValue > 0) {
            this.recordMetric('cls', clsValue, 'gauge', { type: 'core-web-vital' })
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)

        // Resource timing observer
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.trackResourceTiming(entry as PerformanceResourceTiming)
            }
          })
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)

      } catch (error) {
        console.warn('Performance observers not fully supported:', error)
      }
    }
  }

  private trackNavigationTiming (): void {
    window.addEventListener('load', () => {
      // Use a small delay to ensure all timing data is available
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        if (navigation) {
                     const timing: NavigationTiming = {
             dns: navigation.domainLookupEnd - navigation.domainLookupStart,
             tcp: navigation.connectEnd - navigation.connectStart,
             tls: navigation.secureConnectionStart > 0
               ? navigation.connectEnd - navigation.secureConnectionStart
               : 0,
             ttfb: navigation.responseStart - navigation.requestStart,
             domLoad: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
             onLoad: navigation.loadEventEnd - navigation.loadEventStart
           }

          // Record navigation metrics
          Object.entries(timing).forEach(([key, value]) => {
            this.recordMetric(`navigation.${key}`, value, 'timing', { type: 'navigation' })
          })

          // FCP (First Contentful Paint)
          const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
          if (fcpEntry) {
            this.recordMetric('fcp', fcpEntry.startTime, 'timing', { type: 'core-web-vital' })
          }
        }
      }, 100)
    })
  }

  private trackResourceTiming (entry: PerformanceResourceTiming): void {
    const url = new URL(entry.name)
    const resourceType = this.getResourceType(entry.name)

    // Skip data URLs and very small resources
    if (url.protocol === 'data:' || entry.transferSize < 100) {
      return
    }

    this.recordMetric('resource.duration', entry.duration, 'timing', {
      type: 'resource',
      resourceType,
      host: url.hostname
    })

    this.recordMetric('resource.size', entry.transferSize, 'gauge', {
      type: 'resource',
      resourceType,
      host: url.hostname
    })
  }

  private getResourceType (url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()

    if (['js', 'mjs'].includes(extension || '')) return 'script'
    if (['css'].includes(extension || '')) return 'stylesheet'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image'
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font'
    if (url.includes('/api/')) return 'api'

    return 'other'
  }

  public recordMetric (
    name: string,
    value: number,
    type: 'timing' | 'count' | 'gauge' = 'timing',
    tags: Record<string, string> = {}
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      tags
    }

    this.metrics.push(metric)

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Log important metrics in development
    if (import.meta.env.DEV && this.isImportantMetric(name)) {
      console.warn(`📊 Performance: ${name} = ${value.toFixed(2)}ms`, tags)
    }
  }

  private isImportantMetric (name: string): boolean {
    return [
      'lcp', 'fcp', 'fid', 'cls',
      'navigation.ttfb', 'navigation.domLoad', 'navigation.onLoad'
    ].some(important => name.includes(important))
  }

  public startTimer (name: string, tags: Record<string, string> = {}): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, 'timing', tags)
    }
  }

  public measureAsync<T> (
    name: string,
    asyncFn: () => Promise<T>,
    tags: Record<string, string> = {}
  ): Promise<T> {
    const endTimer = this.startTimer(name, tags)

    return asyncFn().finally(() => {
      endTimer()
    })
  }

  public getMetrics (filter?: {
    name?: string
    type?: 'timing' | 'count' | 'gauge'
    since?: number
  }): PerformanceMetric[] {
    let filtered = this.metrics

    if (filter) {
      if (filter.name) {
        filtered = filtered.filter(m => m.name.includes(filter.name!))
      }
      if (filter.type) {
        filtered = filtered.filter(m => m.type === filter.type)
      }
      if (filter.since) {
        filtered = filtered.filter(m => m.timestamp >= filter.since!)
      }
    }

    return filtered
  }

  public getPerformanceSummary (): Record<string, number> {
    const summary: Record<string, number> = {}

    // Core Web Vitals
    const lcp = this.getLatestMetric('lcp')
    const fcp = this.getLatestMetric('fcp')
    const fid = this.getLatestMetric('fid')
    const cls = this.getLatestMetric('cls')

    if (lcp) summary.lcp = lcp.value
    if (fcp) summary.fcp = fcp.value
    if (fid) summary.fid = fid.value
    if (cls) summary.cls = cls.value

    // Navigation timing
    const ttfb = this.getLatestMetric('navigation.ttfb')
    const domLoad = this.getLatestMetric('navigation.domLoad')
    const onLoad = this.getLatestMetric('navigation.onLoad')

    if (ttfb) summary.ttfb = ttfb.value
    if (domLoad) summary.domContentLoaded = domLoad.value
    if (onLoad) summary.windowLoad = onLoad.value

    return summary
  }

  private getLatestMetric (name: string): PerformanceMetric | undefined {
    return this.metrics
      .filter(m => m.name === name)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  public clearMetrics (): void {
    this.metrics = []
  }

  public destroy (): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clearMetrics()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Export utility functions
export const recordMetric = (name: string, value: number, type?: 'timing' | 'count' | 'gauge', tags?: Record<string, string>) =>
  performanceMonitor.recordMetric(name, value, type, tags)

export const startTimer = (name: string, tags?: Record<string, string>) =>
  performanceMonitor.startTimer(name, tags)

export const measureAsync = <T>(name: string, asyncFn: () => Promise<T>, tags?: Record<string, string>) =>
  performanceMonitor.measureAsync(name, asyncFn, tags)

export default performanceMonitor
