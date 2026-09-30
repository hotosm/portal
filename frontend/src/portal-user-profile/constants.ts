import { m } from '../paraglide/messages'
import { EditableField, EditForm } from './types'
const CERTIFICATIONS = [
  {
    title: "Beginner's guide to mapping",
    date: 'Jul 2024',
  },
  { title: 'Humanitarian data ethics', date: 'Jan 2025' },
  { title: 'Tasking Manager for PMs', date: 'Sep 2024' },
  {
    title: 'Remote pilot licence, class 3',
    date: 'Mar 2023',
  },
]

const SECTION_FIELDS = {
  bio: ['bio'],
  location: ['location'],
  contact: ['contact_email', 'phone', 'linkedin_url'],
} as const

// maxlength mirrors the backend limits (app/models/profile.py).
const CONTACT_FIELDS = [
  { field: 'contact_email', type: 'email', icon: 'envelope', variant: 'regular', maxlength: 254, label: () => m.profile_edit_contact_email_label(), addText: () => m.profile_add_contact_email() },
  { field: 'phone', type: 'tel', icon: 'phone', variant: 'solid', maxlength: 32, label: () => m.profile_edit_phone_label(), addText: () => m.profile_add_phone() },
  { field: 'linkedin_url', type: 'url', icon: 'link', variant: 'solid', maxlength: 500, label: () => m.profile_edit_linkedin_url_label(), addText: () => m.profile_add_linkedin() },
] as const

// Mirror the backend limits for extra_links (app/models/profile.py).
const EXTRA_LINKS_MAX = 4
const EXTRA_LINK_MAXLENGTH = 500

const FIELD_ERROR_MESSAGES: Record<Exclude<EditableField, 'location'>, () => string> = {
  bio: () => m.profile_edit_error_bio(),
  contact_email: () => m.profile_edit_error_contact_email(),
  phone: () => m.profile_edit_error_phone(),
  linkedin_url: () => m.profile_edit_error_linkedin_url(),
}

const EMPTY_FORM: EditForm = {
  bio: '',
  location: '',
  contact_email: '',
  phone: '',
  linkedin_url: '',
}

export {CERTIFICATIONS, SECTION_FIELDS, CONTACT_FIELDS, EXTRA_LINKS_MAX, EXTRA_LINK_MAXLENGTH, FIELD_ERROR_MESSAGES, EMPTY_FORM}