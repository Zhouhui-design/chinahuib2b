'use client'

import { useEffect, useCallback } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

interface GA4Event {
  action: string
  category: string
  label?: string
  value?: number
  [key: string]: any
}

export function useGA4() {
  const sendEvent = useCallback((event: GA4Event) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event,
      })
    }
  }, [])

  const pageView = useCallback((pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_ID || '', {
        page_path: pagePath,
        page_title: pageTitle,
      })
    }
  }, [])

  const addToCart = useCallback((productId: string, productName: string, price: number) => {
    sendEvent({
      action: 'add_to_cart',
      category: 'Ecommerce',
      label: productName,
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price,
      }],
    })
  }, [sendEvent])

  const viewItem = useCallback((productId: string, productName: string, price: number) => {
    sendEvent({
      action: 'view_item',
      category: 'Ecommerce',
      label: productName,
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price,
      }],
    })
  }, [sendEvent])

  const search = useCallback((searchTerm: string) => {
    sendEvent({
      action: 'search',
      category: 'Search',
      label: searchTerm,
      search_term: searchTerm,
    })
  }, [sendEvent])

  const click = useCallback((element: string, location: string) => {
    sendEvent({
      action: 'click',
      category: 'Interaction',
      label: element,
      element_location: location,
    })
  }, [sendEvent])

  const formSubmit = useCallback((formName: string, status: 'success' | 'failure') => {
    sendEvent({
      action: 'form_submit',
      category: 'Forms',
      label: formName,
      form_status: status,
    })
  }, [sendEvent])

  const signUp = useCallback((method: string) => {
    sendEvent({
      action: 'sign_up',
      category: 'User Engagement',
      label: method,
      method: method,
    })
  }, [sendEvent])

  const login = useCallback((method: string) => {
    sendEvent({
      action: 'login',
      category: 'User Engagement',
      label: method,
      method: method,
    })
  }, [sendEvent])

  const scrollDepth = useCallback((depth: number) => {
    sendEvent({
      action: 'scroll_depth',
      category: 'Engagement',
      label: `${depth}%`,
      scroll_depth: depth,
    })
  }, [sendEvent])

  const videoPlay = useCallback((videoTitle: string) => {
    sendEvent({
      action: 'video_play',
      category: 'Media',
      label: videoTitle,
    })
  }, [sendEvent])

  return {
    sendEvent,
    pageView,
    addToCart,
    viewItem,
    search,
    click,
    formSubmit,
    signUp,
    login,
    scrollDepth,
    videoPlay,
  }
}

export function useGA4PageView() {
  const { pageView } = useGA4()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      pageView(window.location.pathname, document.title)
    }
  }, [pageView])
}