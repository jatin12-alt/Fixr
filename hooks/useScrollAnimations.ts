'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useScrollAnimations = () => {
  useEffect(() => {
    // Fade Up reveal
    const fadeUpElements = document.querySelectorAll('[data-animation="fade-up"]')
    fadeUpElements.forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          }
        }
      )
    })

    // Staggered Cards
    const staggerContainers = document.querySelectorAll('[data-animation="stagger"]')
    staggerContainers.forEach((container) => {
      const cards = container.querySelectorAll('.animate-card')
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
          }
        }
      )
    })

    // Counter animations
    const counters = document.querySelectorAll('[data-animation="counter"]')
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10)
      gsap.from(counter, {
        textContent: 0,
        duration: 2.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: counter,
          start: 'top 80%',
        },
        onUpdate: function() {
          if (counter.textContent) {
            counter.textContent = Math.floor(Number(counter.textContent)).toLocaleString()
          }
        }
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])
}
