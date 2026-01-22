import './style.css'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const animatedElements = document.querySelectorAll('[data-animate]')
const parallaxItems = document.querySelectorAll('[data-parallax]')

const revealElements = () => {
  animatedElements.forEach((element) => element.classList.add('is-visible'))
}

if (prefersReducedMotion.matches) {
  revealElements()
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  )

  animatedElements.forEach((element) => observer.observe(element))
}

if (parallaxItems.length && !prefersReducedMotion.matches) {
  let ticking = false

  const updateParallax = () => {
    const scrollY = window.scrollY
    parallaxItems.forEach((item) => {
      const speed = Number.parseFloat(item.dataset.parallax || '0.15')
      item.style.setProperty('--parallax-y', `${scrollY * speed}px`)
    })
    ticking = false
  }

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax)
      ticking = true
    }
  }

  updateParallax()
  window.addEventListener('scroll', onScroll, { passive: true })
}

prefersReducedMotion.addEventListener('change', (event) => {
  if (event.matches) {
    revealElements()
  }
})

const stripeButton = document.querySelector('#stripe-checkout')
const ticketRadios = document.querySelectorAll('input[name="ticket-tier"]')

if (stripeButton) {
  stripeButton.addEventListener('click', async () => {
    const publishableKey = stripeButton.dataset.stripeKey
    const selectedTier = document.querySelector('input[name="ticket-tier"]:checked')
    const priceId = selectedTier?.dataset.priceId
    const successUrl = stripeButton.dataset.successUrl || window.location.origin
    const cancelUrl = stripeButton.dataset.cancelUrl || window.location.href

    const isMocked =
      publishableKey === 'pk_test_mock' || (priceId ? priceId.startsWith('price_mock') : false)

    if (!publishableKey || !priceId) {
      window.alert('Stripe checkout is not configured. Please add your publishable key and price ID.')
      return
    }

    if (!selectedTier) {
      window.alert('Please select a ticket option to continue.')
      return
    }

    if (isMocked) {
      const tierName = selectedTier?.dataset.display || 'this ticket'
      window.alert(`Mock checkout enabled for ${tierName}. Replace Stripe keys to process real payments.`)
      return
    }

    if (!window.Stripe) {
      window.alert('Stripe.js failed to load. Please check your network connection.')
      return
    }

    const stripe = window.Stripe(publishableKey)
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      successUrl,
      cancelUrl,
    })

    if (error) {
      window.alert(error.message)
    }
  })
}
