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
    if (key === 'ticketButtonLabel' && element instanceof HTMLAnchorElement) {
      element.textContent = content[key]
      if (content.ticketUrl) {
        element.href = content.ticketUrl
      }
    }
  })

  document.querySelectorAll('[data-content-link]').forEach((element) => {
    const key = element.dataset.contentLink
    if (!key || !content[key]) return

    if (element instanceof HTMLAnchorElement) {
      element.href = content[key]
    }

    if (element instanceof HTMLIFrameElement) {
      const url = new URL(element.src)
      if (key === 'gofundmeUrl') {
        url.href = `${content[key]}/widget/large`
      } else {
        url.href = content[key]
      }
      element.src = url.toString()
    }
  })

  document.querySelectorAll('[data-content-image]').forEach((element) => {
    const key = element.dataset.contentImage
    if (!key || !content[key] || !(element instanceof HTMLImageElement)) return
    element.src = content[key]
  })

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
