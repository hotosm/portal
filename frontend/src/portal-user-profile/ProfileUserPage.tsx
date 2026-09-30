import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/shared/Button'
import CardDataError from '../components/shared/CardDataError'
import Dropdown from '../components/shared/Dropdown'
import DropdownItem from '../components/shared/DropdownItem'
import Icon from '../components/shared/Icon'
import PageWrapper from '../components/shared/PageWrapper'
import Spinner from '../components/shared/Spinner'
import { useAuth } from '../contexts/AuthContext'
import NotFoundPage from '../pages/NotFoundPage'
import { m } from '../paraglide/messages'
import ProfileSectionHeader from '../portal-plans/components/ProfileSectionHeader'
import { Certifications } from './components/Certifications'
import { ContactInfo } from './components/ContactInfo'
import { GroupList } from './components/GroupList'
import UserProfileBioField from './components/UserProfileBioField'
import UserProfileLocationField from './components/UserProfileLocationField'
import { EMPTY_FORM, FIELD_ERROR_MESSAGES, SECTION_FIELDS } from './constants'
import {
  type PortalProfilePatch,
  PortalProfileValidationError,
  useMyPortalProfile,
  useUpdateMyPortalProfile,
} from './hooks/useMyPortalProfile'
import {
  PublicProfileUnavailableError,
  usePublicProfile
} from './hooks/usePublicProfile'
import type {
  EditableField,
  EditableSection,
  EditForm
} from './types'


function ProfileUserPage() {
  // The :username segment of /:locale/people/:username is the profile slug.
  const { username: slug } = useParams()

  const { data: profile, isLoading, error } = usePublicProfile(slug)
  const { isLogin } = useAuth()
  const { data: me, isPending: isMePending } = useMyPortalProfile()
  const updateProfile = useUpdateMyPortalProfile()

  const isMine = !!slug && me?.slug === slug
  // Signed in but /api/profile/me hasn't answered yet: we can't tell the owner
  // from a visitor, so the contact block waits instead of flashing the wrong one.
  const isOwnerUnknown = isLogin && isMePending


  // At most one section is open at a time; null means the whole page is read-only.
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null)
  const [form, setForm] = useState<EditForm>(EMPTY_FORM)
  // Fields edited since the last save attempt: their field error is cleared.
  const [touchedFields, setTouchedFields] = useState<ReadonlySet<EditableField>>(new Set())
  // extra_links is a list, so it's drafted apart from the string-only form.
  const [extraLinksDraft, setExtraLinksDraft] = useState<string[]>([])
  // Draft rows edited since the last save attempt: their error is cleared.
  const [touchedExtraLinks, setTouchedExtraLinks] = useState<ReadonlySet<number>>(new Set())
  // Blank rows aren't sent, so the backend's item indexes point into the sent
  // list; this maps each sent index back to its draft row.
  const [sentExtraLinkRows, setSentExtraLinkRows] = useState<number[]>([])

  // Prefill from /api/profile/me rather than from the public payload: it's the
  // owner's own copy, and it's what the PATCH is diffed against.
  const startEditing = (section: EditableSection) => {
    setForm((previous) => {
      const next = { ...previous }
      for (const field of SECTION_FIELDS[section]) {
        next[field] = me?.portal[field] ?? ''
      }
      return next
    })
    if (section === 'contact') {
      setExtraLinksDraft([...(me?.portal.extra_links ?? [])])
    }
    updateProfile.reset()
    setTouchedFields(new Set())
    setTouchedExtraLinks(new Set())
    setEditingSection(section)
  }

  const cancelEditing = () => {
    updateProfile.reset()
    setTouchedFields(new Set())
    setTouchedExtraLinks(new Set())
    setExtraLinksDraft([...(me?.portal.extra_links ?? [])])
    setEditingSection(null)
  }

  const setField = (field: EditableField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    setTouchedFields((previous) => (previous.has(field) ? previous : new Set(previous).add(field)))
  }

  const setExtraLink = (index: number, value: string) => {
    setExtraLinksDraft((previous) => previous.map((link, i) => (i === index ? value : link)))
    setTouchedExtraLinks((previous) =>
      previous.has(index) ? previous : new Set(previous).add(index)
    )
  }

  const addExtraLink = () => {
    setExtraLinksDraft((previous) => [...previous, ''])
  }

  // Removing a row shifts the ones below it, so no row error can be trusted
  // to still point at the right input: all of them are cleared.
  const removeExtraLink = (index: number) => {
    setExtraLinksDraft((previous) => previous.filter((_, i) => i !== index))
    setTouchedExtraLinks(new Set(extraLinksDraft.map((_, i) => i)))
  }

  // The public profile URL is whatever the visitor is already looking at.
  const shareProfile = (event: CustomEvent) => {
    if (event.detail.item.value === 'copy-link') {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Only the open section's fields travel in the patch, so saving one section
  // never touches what another one holds.
  const saveEditing = (section: EditableSection) => {
    const patch: PortalProfilePatch = {}
    setTouchedFields(new Set())

    for (const field of SECTION_FIELDS[section]) {
      // A cleared field has to go out as null: "" fails the backend's email and
      // LinkedIn patterns, and null is how the column is emptied.
      const next = form[field].trim() || null
      if (next !== (me?.portal[field] ?? null)) {
        patch[field] = next
      }
    }

    if (section === 'contact') {
      setTouchedExtraLinks(new Set())
      const rows = extraLinksDraft
        .map((link, row) => ({ link: link.trim(), row }))
        .filter(({ link }) => link !== '')
      const nextLinks = rows.map(({ link }) => link)
      const currentLinks = me?.portal.extra_links ?? []
      setSentExtraLinkRows(rows.map(({ row }) => row))
      if (
        nextLinks.length !== currentLinks.length ||
        nextLinks.some((link, i) => link !== currentLinks[i])
      ) {
        patch.extra_links = nextLinks
      }
    }

    if (Object.keys(patch).length === 0) {
      setEditingSection(null)
      return
    }

    updateProfile.mutate(patch, { onSuccess: () => setEditingSection(null) })
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-xl">
          <Spinner size="md" label={m.profile_loading()} />
        </div>
      </PageWrapper>
    )
  }

  // 502 means portal couldn't reach login to confirm visibility; anything else
  // that throws is just as unrenderable. Either way: an error, not a 404.
  if (error) {
    return (
      <PageWrapper>
        <div className="py-xl">
          <CardDataError />
          {error instanceof PublicProfileUnavailableError && (
            <p className="text-sm text-hot-gray-600 mt-sm">{m.profile_error_upstream()}</p>
          )}
        </div>
      </PageWrapper>
    )
  }

  if (!profile) {
    // The backend 404s alike for "no such user" and "not public", so only the
    // owner gets told which one it is.
    if (isMine) {
      return (
        <PageWrapper>
          <div className="flex flex-col gap-xs py-xl">
            <p className="text-2xl font-bold text-hot-gray-950">
              {m.profile_not_available_title()}
            </p>
            <p className="text-hot-gray-600">{m.profile_not_public_own()}</p>
          </div>
        </PageWrapper>
      )
    }
    return <NotFoundPage />
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  const displayName = fullName || profile.slug

  const organizations = profile.organizations ?? []
  const teams = profile.teams ?? []


  // The open section's fields the backend rejected and that have a message of
  // their own; each one shows under its input until it's edited again.
  const validationError =
    updateProfile.error instanceof PortalProfileValidationError ? updateProfile.error : null
  const openFields: readonly EditableField[] = editingSection ? SECTION_FIELDS[editingSection] : []
  const invalidFields = validationError
    ? openFields.filter(
        (field): field is keyof typeof FIELD_ERROR_MESSAGES =>
          field in FIELD_ERROR_MESSAGES && validationError.fields.includes(field)
      )
    : []
  const fieldErrors: Partial<Record<EditableField, string>> = Object.fromEntries(
    invalidFields
      .filter((field) => !touchedFields.has(field))
      .map((field) => [field, FIELD_ERROR_MESSAGES[field]()])
  )

  // An item error lands on its row; one without an index (too many links,
  // duplicates) is shown once for the whole list.
  const hasExtraLinksError =
    editingSection === 'contact' && !!validationError?.fields.includes('extra_links')
  const extraLinkErrors: Partial<Record<number, string>> = hasExtraLinksError
    ? Object.fromEntries(
        (validationError?.extraLinkIndexes ?? [])
          .map((index) => sentExtraLinkRows[index])
          .filter((row) => row !== undefined && !touchedExtraLinks.has(row))
          .map((row) => [row, m.profile_edit_error_extra_link()])
      )
    : {}
  const extraLinksError =
    hasExtraLinksError && validationError?.extraLinkIndexes.length === 0
      ? m.profile_edit_error_extra_links()
      : null

  // Section-wide only when no field can carry the error itself.
  const saveError = updateProfile.error
    ? validationError
      ? invalidFields.length > 0 || hasExtraLinksError
        ? null
        : m.profile_edit_error_validation()
      : m.profile_edit_error_save()
    : null


  // Every pencil hides while a section is open, so two sections can't be
  // edited at once.
  const canEdit = isMine && editingSection === null

  // Share is offered to every visitor; editing lives inline in each section.
  const headerControls = (
    <div className="flex gap-xs">
      <Dropdown onSelect={shareProfile}>
        <Button slot="trigger">
          Share profile
          <Icon slot="end" library="bootstrap" name="chevron-down" label="" />
        </Button>
        <DropdownItem value="copy-link">
          <Icon slot="icon" library="bootstrap" name="link-45deg" label="" />
          Copy link
        </DropdownItem>
      </Dropdown>
    </div>
  )

  return (
    <>
      <ProfileSectionHeader menu={headerControls}>
        <p className="text-sm mb-xs">People</p>
        <h1 className="text-2xl/tight break-words">{displayName}</h1>
        <UserProfileLocationField
          location={profile.location}
          draft={form.location}
          onDraftChange={(v) => setField('location', v)}
          isEditing={editingSection === 'location'}
          canEdit={canEdit}
          isPending={updateProfile.isPending}
          saveError={saveError}
          onStartEditing={() => startEditing('location')}
          onSave={() => saveEditing('location')}
          onCancel={cancelEditing}
        />
      </ProfileSectionHeader>

      <PageWrapper>
        <section className='mb-2xl'>
          <UserProfileBioField
            bio={profile.bio}
            draft={form.bio}
            onDraftChange={(v) => setField('bio', v)}
            fieldError={fieldErrors.bio}
            isEditing={editingSection === 'bio'}
            canEdit={canEdit}
            isPending={updateProfile.isPending}
            saveError={saveError}
            onStartEditing={() => startEditing('bio')}
            onSave={() => saveEditing('bio')}
            onCancel={cancelEditing}
          />
        </section>
        
      {/* 2 col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-xl">
          <div>
            <section className='mb-2xl'>
                <GroupList
                  title={m.profile_organizations_title()}
                  groups={organizations}
                  variant="organization"
                />
              </section>
              <section className='mb-2xl'>
                <GroupList title={m.profile_teams_title()} groups={teams} variant="team" />
              </section>

            <section className='mb-2xl'>
              <Certifications />
            </section>
          </div>

          <div>
            <section className='mb-2xl'>
              <ContactInfo
                slug={slug}
                isMine={isMine}
                isOwnerUnknown={isOwnerUnknown}
                hasContact={profile.has_contact}
                ownContact={me?.portal}
                draft={form}
                onDraftChange={setField}
                fieldErrors={fieldErrors}
                extraLinksDraft={extraLinksDraft}
                onExtraLinkChange={setExtraLink}
                onAddExtraLink={addExtraLink}
                onRemoveExtraLink={removeExtraLink}
                extraLinkErrors={extraLinkErrors}
                extraLinksError={extraLinksError}
                isEditing={editingSection === 'contact'}
                canEdit={canEdit}
                isPending={updateProfile.isPending}
                saveError={saveError}
                onStartEditing={() => startEditing('contact')}
                onSave={() => saveEditing('contact')}
                onCancel={cancelEditing}
              />
            </section>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}

export default ProfileUserPage
