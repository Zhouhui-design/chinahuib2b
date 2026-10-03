'use client'

import { useEffect, useRef } from 'react'

interface StoreMapProps {
  latitude: number
  longitude: number
}

/**
 * 基于 Leaflet + OpenStreetMap 的免费地图组件。
 * 完全免费、无需 API Key，用于根据经纬度显示位置标记。
 *
 * 注意：Leaflet 需要的 CSS 在此处通过 CDN 动态注入，避免 SSR 报错；
 * 地图本身采用动态 import 加载 leaflet，保证只在浏览器端执行。
 */
export default function StoreMap({ latitude, longitude }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    let disposed = false
    let mapInstance: any = null
    let markerInstance: any = null

    async function init() {
      if (!containerRef.current) return
      // 动态注入 Leaflet CSS
      const linkId = 'leaflet-css'
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity =
          'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
      }

      const L = (await import('leaflet')).default
      if (disposed || !containerRef.current) return

      // 避免重复初始化
      if (mapRef.current) return

      const container = containerRef.current
      mapInstance = L.map(container, {
        center: [latitude, longitude],
        zoom: 14,
        scrollWheelZoom: true,
      })

      // OpenStreetMap 瓦片（完全免费）
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)

      markerInstance = L.marker([latitude, longitude], {
        draggable: false,
      }).addTo(mapInstance)

      markerInstance.bindPopup('GPS: ' + latitude + ', ' + longitude).openPopup()

      mapRef.current = mapInstance
      markerRef.current = markerInstance
    }

    init()

    return () => {
      disposed = true
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '256px' }}
      className="rounded-lg"
    />
  )
}
