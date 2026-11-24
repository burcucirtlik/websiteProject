import { defineConfig } from 'tinacms'

// Tina Cloud reads content from this branch. GitHub Actions sets GITHUB_REF_NAME.
const branch = process.env.GITHUB_BRANCH || process.env.GITHUB_REF_NAME || 'main'

const text = (name, label, description) => ({ type: 'string', name, label, description })
const longText = (name, label, description) => ({
  type: 'string',
  name,
  label,
  description,
  ui: { component: 'textarea' },
})
const url = (name, label, description) => ({
  type: 'string',
  name,
  label,
  description,
  ui: {
    validate: (value) => {
      if (!value) return
      if (!/^(https?:\/\/|mailto:|\/)/.test(value)) {
        return 'Must start with https://, http://, mailto: or /'
      }
    },
  },
})
const pdf = (name, label) => ({
  type: 'image',
  name,
  label,
  description: 'Upload a PDF. It opens in a new tab from the footer.',
})

const formattingHint =
  'Leave an empty line between paragraphs. Lines starting with "-" become a bullet list.'

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
    accept: ['image/*', 'application/pdf'],
  },

  schema: {
    collections: [
      {
        name: 'site',
        label: 'Homepage',
        path: 'public/content',
        format: 'json',
        match: { include: 'site' },
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        fields: [
          // Header and hero
          text('festivalName', 'Festival name', 'Shown in the header and page title.'),
          text('headerMeta', 'Header line', 'Small text next to the festival name.'),
          text('eyebrow', 'Hero: small line above the title'),
          text('heroTitle', 'Hero: title'),
          longText('heroLead', 'Hero: intro text'),
          longText('note', 'Hero: note'),
          text('ticketButtonLabel', 'Ticket button text'),
          url('ticketUrl', 'Ticket link', 'pretix page where people buy tickets.'),

          // Dates and location
          text('datesLabel', 'Dates: label'),
          text('datesValue', 'Dates: value', 'For example: 22–24 May 2026'),
          text('locationLabel', 'Location: label'),
          text('locationValue', 'Location: value'),

          // Support / GoFundMe
          text('supportTitle', 'Support: title'),
          longText('supportDescription', 'Support: text'),
          text('supportButtonLabel', 'Support: button text'),
          url('gofundmeUrl', 'GoFundMe link', 'The campaign link, without /widget at the end.'),

          // Venue and travel
          text('venueTitle', 'Venue: title'),
          longText('venueDescription', 'Venue: text', formattingHint),
          text('travelTitle', 'Travel: title'),
          longText('travelDescription', 'Travel: text', formattingHint),
          {
            type: 'object',
            name: 'travelSections',
            label: 'Travel: routes',
            description: 'Each route is a dropdown on the site. Drag to reorder.',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'New route' }) },
            fields: [
              text('title', 'Title'),
              longText('description', 'Text', formattingHint),
            ],
          },

          // FAQ
          text('faqTitle', 'FAQ: title'),
          text('faqDescription', 'FAQ: subtitle'),
          {
            type: 'object',
            name: 'faqs',
            label: 'FAQ: questions',
            description: 'The first question opens by default. Drag to reorder.',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.question || 'New question' }) },
            fields: [
              text('question', 'Question'),
              longText('answer', 'Answer', formattingHint),
            ],
          },

          // Partners
          text('partnersTitle', 'Partners: title'),
          text('partnersDescription', 'Partners: subtitle'),
          {
            type: 'string',
            name: 'partners',
            label: 'Partners: names',
            list: true,
          },

          // Contact and footer
          text('contactTitle', 'Contact: title'),
          longText('contactDescription', 'Contact: text'),
          text('email', 'Contact email'),
          url('instagramUrl', 'Instagram link'),
          text('instagramLabel', 'Instagram handle', 'For example: @kunterbuntjuggling'),
          text('footerTitle', 'Footer: title'),
          text('footerDescription', 'Footer: text'),

          // Legal
          text('termsTitle', 'Terms: title'),
          longText('termsDescription', 'Terms: text', formattingHint),
          text('privacyDocumentOneLabel', 'Legal document 1: link text'),
          pdf('privacyDocumentOneUrl', 'Legal document 1: PDF'),
          text('privacyDocumentTwoLabel', 'Legal document 2: link text'),
          pdf('privacyDocumentTwoUrl', 'Legal document 2: PDF'),
          text('footerCopyright', 'Footer: copyright line'),
        ],
      },
    ],
  },
})
