/**
 * A/B Testing Experiments Configuration
 * 
 * Define your experiments here
 */

import { Experiment } from './ab-testing';

/**
 * Example: CTA Button Color Test
 * Tests whether red or green CTA buttons convert better
 */
export const ctaButtonColorTest: Experiment = {
  id: 'cta_button_color',
  name: 'CTA Button Color Test',
  description: 'Test red vs green CTA button colors on product pages',
  variants: [
    {
      id: 'control',
      name: 'Control (Blue)',
      weight: 50,
      config: {
        color: 'blue',
        className: 'bg-blue-600 hover:bg-blue-700'
      }
    },
    {
      id: 'variant_a',
      name: 'Variant A (Red)',
      weight: 50,
      config: {
        color: 'red',
        className: 'bg-red-600 hover:bg-red-700'
      }
    }
  ],
  trafficPercentage: 100, // Test on all users
  status: 'draft',
  goals: [
    {
      id: 'cta_click',
      name: 'CTA Click',
      type: 'click',
      selector: '[data-ab-cta-button]'
    },
    {
      id: 'inquiry_submit',
      name: 'Inquiry Submission',
      type: 'conversion',
      value: 10
    }
  ]
};

/**
 * Example: Product Card Layout Test
 * Tests grid vs list view for product listings
 */
export const productCardLayoutTest: Experiment = {
  id: 'product_card_layout',
  name: 'Product Card Layout Test',
  description: 'Test grid vs list view for better engagement',
  variants: [
    {
      id: 'grid_view',
      name: 'Grid View',
      weight: 50,
      config: {
        layout: 'grid',
        columns: 3
      }
    },
    {
      id: 'list_view',
      name: 'List View',
      weight: 50,
      config: {
        layout: 'list',
        columns: 1
      }
    }
  ],
  trafficPercentage: 50, // Test on 50% of users
  status: 'draft',
  goals: [
    {
      id: 'product_view',
      name: 'Product Page View',
      type: 'pageview'
    },
    {
      id: 'add_to_inquiry',
      name: 'Add to Inquiry',
      type: 'conversion',
      value: 5
    }
  ]
};

/**
 * Example: Homepage Hero Banner Test
 * Tests different hero banner designs
 */
export const heroBannerTest: Experiment = {
  id: 'hero_banner',
  name: 'Homepage Hero Banner Test',
  description: 'Test different hero banner designs for better engagement',
  variants: [
    {
      id: 'original',
      name: 'Original Design',
      weight: 34,
      config: {
        title: 'Welcome to Chinahuib2b',
        subtitle: 'Your B2B Trading Platform',
        backgroundImage: '/images/hero-original.jpg'
      }
    },
    {
      id: 'variant_a',
      name: 'Variant A - Video Background',
      weight: 33,
      config: {
        title: 'Connect with Global Suppliers',
        subtitle: 'Start Your Business Journey Today',
        videoBackground: '/videos/hero-video.mp4'
      }
    },
    {
      id: 'variant_b',
      name: 'Variant B - Minimalist',
      weight: 33,
      config: {
        title: 'B2B Made Simple',
        subtitle: 'Trade Smarter, Not Harder',
        backgroundImage: '/images/hero-minimal.jpg'
      }
    }
  ],
  trafficPercentage: 100,
  status: 'draft',
  goals: [
    {
      id: 'scroll_depth',
      name: 'Scroll to 50%',
      type: 'custom'
    },
    {
      id: 'signup_click',
      name: 'Sign Up Click',
      type: 'click',
      selector: '[data-ab-signup-button]'
    }
  ]
};

/**
 * All experiments registry
 */
export const allExperiments: Experiment[] = [
  ctaButtonColorTest,
  productCardLayoutTest,
  heroBannerTest
];

/**
 * Initialize all experiments
 */
export function initializeABTests(): void {
  const { abTesting } = require('./ab-testing');
  
  allExperiments.forEach(experiment => {
    abTesting.registerExperiment(experiment);
  });
  
  console.log(`[A/B Test] Initialized ${allExperiments.length} experiments`);
}
