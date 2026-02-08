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

const applyContent = (content) => {
  document.querySelectorAll('[data-content]').forEach((element) => {
    const key = element.dataset.content
    if (!key || content[key] === undefined) return
    element.textContent = content[key]

    if (key === 'email' && element instanceof HTMLAnchorElement) {
      element.href = `mailto:${content[key]}`
    }
    if (key === 'phone' && element instanceof HTMLAnchorElement) {
      element.href = `tel:${content[key].replace(/\\s+/g, '')}`
    }
  })

  if (Array.isArray(content.ticketOptions)) {
    content.ticketOptions.forEach((option, index) => {
      const tier = document.querySelector(`[data-ticket-tier=\"${option.tierId}\"]`)
      if (!tier) return
      const titleEl = tier.querySelector('[data-ticket-field=\"title\"]')
      const priceEl = tier.querySelector('[data-ticket-field=\"priceLabel\"]')
      const input = tier.querySelector('input[type=\"radio\"]')

      if (titleEl) titleEl.textContent = option.title
      if (priceEl) priceEl.textContent = option.priceLabel
      if (input) {
        input.dataset.priceId = option.priceId
        input.dataset.display = option.title
        input.checked = index === 0
      }
    })
  }

  const travelList = document.querySelector('[data-list=\"travelBullets\"]')
  if (travelList && Array.isArray(content.travelBullets)) {
    travelList.innerHTML = ''
    content.travelBullets.forEach((item) => {
      const li = document.createElement('li')
      li.textContent = item
      travelList.appendChild(li)
    })
  }

  const faqList = document.querySelector('[data-list=\"faqs\"]')
  if (faqList && Array.isArray(content.faqs)) {
    faqList.innerHTML = ''
    content.faqs.forEach((item, index) => {
      const details = document.createElement('details')
      if (index === 0) details.open = true
      const summary = document.createElement('summary')
      summary.textContent = item.question
      const answer = document.createElement('p')
      answer.textContent = item.answer
      details.appendChild(summary)
      details.appendChild(answer)
      faqList.appendChild(details)
    })
  }

  const partnersList = document.querySelector('[data-list=\"partners\"]')
  if (partnersList && Array.isArray(content.partners)) {
    partnersList.innerHTML = ''
    content.partners.forEach((partner) => {
      const div = document.createElement('div')
      div.className = 'sponsor'
      div.textContent = partner
      partnersList.appendChild(div)
    })
  }
}

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

fetch('./content/site.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to load content')
    }
    return response.json()
  })
  .then((data) => applyContent(data))
  .catch((error) => {
    console.warn('Content load error:', error)
  })
