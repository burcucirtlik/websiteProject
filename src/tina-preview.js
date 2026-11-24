// Live preview for the Tina admin (/admin).
// Loaded only when the site runs inside the admin's preview iframe:
// edits in the sidebar re-render the page instantly, and clicking a text
// on the page jumps to its field in the sidebar.
import { hashFromQuery } from '@tinacms/bridge/metadata'
import { QUICK_EDIT_CSS } from '@tinacms/bridge/quick-edit-css'

const QUERY = `query site($relativePath: String!) {
  site(relativePath: $relativePath) {
    festivalName headerMeta eyebrow heroTitle heroLead note
    ticketButtonLabel ticketUrl
    datesLabel datesValue locationLabel locationValue
    supportTitle supportDescription supportButtonLabel gofundmeUrl
    venueTitle venueDescription travelTitle travelDescription
    travelSections { title description }
    faqTitle faqDescription faqs { question answer }
    partnersTitle partnersDescription partners
    contactTitle contactDescription email instagramUrl instagramLabel
    footerTitle footerDescription
    termsTitle termsDescription
    privacyDocumentOneLabel privacyDocumentOneUrl
    privacyDocumentTwoLabel privacyDocumentTwoUrl
    footerCopyright
  }
}`

const variables = { relativePath: 'site.json' }
const id = hashFromQuery(JSON.stringify({ query: QUERY, variables }))
const origin = window.location.origin
const field = (path) => `${id}---site.${path}`

const isFromAdmin = (event) => event.origin === origin && event.source === window.parent

// Mark every editable element so a click can open its field.
const tagFields = () => {
  document.querySelectorAll('[data-content]').forEach((el) => {
    el.setAttribute('data-tina-field', field(el.dataset.content))
  })
  const lists = { travelSections: 'details', faqs: 'details', partners: '.sponsor' }
  Object.entries(lists).forEach(([name, selector]) => {
    document.querySelectorAll(`[data-list="${name}"] > ${selector}`).forEach((el, index) => {
      el.setAttribute('data-tina-field', field(`${name}.${index}`))
    })
  })
}

let quickEditStyle = null
const setQuickEdit = (enabled) => {
  if (enabled && !quickEditStyle) {
    quickEditStyle = document.createElement('style')
    quickEditStyle.textContent = QUICK_EDIT_CSS
    document.head.appendChild(quickEditStyle)
    document.body.classList.add('__tina-quick-editing-enabled')
  } else if (!enabled && quickEditStyle) {
    quickEditStyle.remove()
    quickEditStyle = null
    document.body.classList.remove('__tina-quick-editing-enabled')
  }
}

export const initTinaPreview = (initialContent, applyContent) => {
  tagFields()

  document.addEventListener(
    'click',
    (event) => {
      if (!quickEditStyle) return
      const target = event.target.closest('[data-tina-field]')
      if (!target) return
      event.preventDefault()
      event.stopPropagation()
      window.parent.postMessage(
        { type: 'field:selected', fieldName: target.getAttribute('data-tina-field') },
        origin
      )
    },
    true
  )

  window.addEventListener('message', (event) => {
    if (!isFromAdmin(event)) return
    const message = event.data || {}
    if (message.type === 'quickEditEnabled') {
      setQuickEdit(Boolean(message.value))
    }
    if (message.type === 'updateData' && message.id === id && message.data?.site) {
      applyContent(message.data.site)
      tagFields()
      window.parent.postMessage({ type: 'quick-edit', value: true }, origin)
    }
  })

  window.parent.postMessage({ type: 'url-changed' }, origin)
  window.parent.postMessage(
    { type: 'open', query: QUERY, variables, data: { site: initialContent }, id },
    origin
  )
}
