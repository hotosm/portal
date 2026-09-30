import type { SECTION_FIELDS } from './constants'
import type { PublicContact, PublicProfileGroup } from './hooks/usePublicProfile'

interface ProfileSectionHeaderProps {
  children?: any
  buttonText?: string
  buttonLink?: string
  onButtonClick?: () => void
  menu?: React.ReactNode
}

type EditableSection = keyof typeof SECTION_FIELDS
type EditableField = (typeof SECTION_FIELDS)[EditableSection][number]
type EditForm = Record<EditableField, string>

type GroupVariant = 'organization' | 'team'

type AvatarSquareProps = {
  initials: string
  variant: GroupVariant
}

type GroupListProps = {
  title: string
  groups: PublicProfileGroup[]
  variant: GroupVariant
}

type EditTriggerProps = {
  label?: string
  text?: string
  onClick: () => void
  className?: string
}

type EditActionsProps = {
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  saveDisabled?: boolean
}

type EditErrorProps = {
  error: string | null
}

type SectionEditProps = {
  isEditing: boolean
  canEdit: boolean
  isPending: boolean
  saveError: string | null
  onStartEditing: () => void
  onSave: () => void
  onCancel: () => void
}

type UserProfileBioFieldProps = SectionEditProps & {
  bio: string | null | undefined   // valor público (lectura)
  draft: string                    // form.bio
  onDraftChange: (value: string) => void
  fieldError?: string
}

type UserProfileLocationFieldProps = SectionEditProps & {
  location: string | null | undefined // valor público (lectura)
  draft: string // form.location
  onDraftChange: (value: string) => void
}

type ContactField = (typeof SECTION_FIELDS)['contact'][number]

type ContactInfoProps = SectionEditProps & {
  slug: string | undefined
  isMine: boolean
  // Signed in but /api/profile/me hasn't answered yet: owner or visitor is unknown.
  isOwnerUnknown: boolean
  hasContact: boolean
  // The owner's own copy (me.portal); visitors get theirs from the reveal.
  ownContact: PublicContact | undefined
  draft: Pick<EditForm, ContactField>
  onDraftChange: (field: ContactField, value: string) => void
  fieldErrors: Partial<Record<EditableField, string>>
  // extra_links lives outside EditForm: it's a list, not a string field.
  extraLinksDraft: string[]
  onExtraLinkChange: (index: number, value: string) => void
  onAddExtraLink: () => void
  onRemoveExtraLink: (index: number) => void
  // Per-row errors, keyed by the row's index in extraLinksDraft.
  extraLinkErrors: Partial<Record<number, string>>
  // A list-wide rejection (too many, duplicates) that no single row can carry.
  extraLinksError: string | null
}

export type {
  ProfileSectionHeaderProps,
  EditableSection,
  EditableField,
  EditForm,
  GroupVariant,
  AvatarSquareProps,
  GroupListProps,
  EditTriggerProps,
  EditActionsProps,
  EditErrorProps,
  SectionEditProps,
  UserProfileBioFieldProps,
  UserProfileLocationFieldProps,
  ContactField,
  ContactInfoProps,
}
