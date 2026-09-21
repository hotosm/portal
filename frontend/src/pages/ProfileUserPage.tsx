import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import starIcon from '../assets/icons/star.svg?url'
import Button from '../components/shared/Button'
import CardDataError from '../components/shared/CardDataError'
import Dropdown from '../components/shared/Dropdown'
import DropdownItem from '../components/shared/DropdownItem'
import Icon from '../components/shared/Icon'
import Input from '../components/shared/Input'
import PageWrapper from '../components/shared/PageWrapper'
import Spinner from '../components/shared/Spinner'
import Textarea from '../components/shared/Textarea'
import { useLanguage } from '../contexts/LanguageContext'
import {
  type PortalProfilePatch,
  PortalProfileValidationError,
  useMyPortalProfile,
  useUpdateMyPortalProfile,
} from '../hooks/useMyPortalProfile'
import { PublicProfileUnavailableError, usePublicProfile } from '../hooks/usePublicProfile'
import { m } from '../paraglide/messages'
import ProfileSectionHeader from '../portal-plans/components/ProfileSectionHeader'
import NotFoundPage from './NotFoundPage'

// Still a visual pass: teams, mapping profiles and certifications below are
// hardcoded sample content with no endpoint behind them yet.
const MAPPING_PROFILES = [
  {
    platform: 'OpenStreetMap',
    handle: 'elenaficher',
    href: 'https://www.openstreetmap.org/user/elenaficher',
  },
  {
    platform: 'Tasking Manager',
    handle: 'elenaficher',
    href: 'https://tasks.hotosm.org/users/elenaficher',
  },
]

const TEAMS = [{ name: 'Nepal Mapping Team', initials: 'NM' }]

const CERTIFICATIONS = [
  {
    title: "Beginner's guide to mapping",
    issuer: 'OpenStreetMap Learn',
    date: 'Jul 2024',
  },
  { title: 'Humanitarian data ethics', issuer: 'HOT Academy', date: 'Jan 2025' },
  { title: 'Tasking Manager for PMs', issuer: 'HOT Academy', date: 'Sep 2024' },
  {
    title: 'Remote pilot licence, class 3',
    issuer: 'ANAC Argentina',
    date: 'Mar 2023',
  },
]

// The portal-owned fields the profile's owner can edit inline, grouped by the
// section that owns them: each section is opened, saved and cancelled on its
// own. Account fields (name, slug, picture) belong to login and are read-only
// here.
const SECTION_FIELDS = {
  bio: ['bio'],
  location: ['location'],
  contact: ['contact_email', 'phone', 'linkedin_url'],
} as const

type EditableSection = keyof typeof SECTION_FIELDS
type EditableField = (typeof SECTION_FIELDS)[EditableSection][number]
type EditForm = Record<EditableField, string>

const EMPTY_FORM: EditForm = {
  bio: '',
  location: '',
  contact_email: '',
  phone: '',
  linkedin_url: '',
}

// Stand-in for the organization/team logos: initials on a tinted square.
function AvatarSquare({
  initials,
  variant,
}: {
  initials: string
  variant: 'organization' | 'team'
}) {
  const palette =
    variant === 'team' ? 'bg-hot-blue-600 text-white' : 'bg-hot-gray-100 text-hot-gray-700'

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-sm text-2xs font-bold ${palette}`}
    >
      {initials}
    </span>
  )
}

/** "Médecins Sans Frontières" -> "MS". Empty when there's nothing to take. */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/**
 * Owner-only affordance that opens one section for editing. A bare pencil when
 * the section already has something to show; with `text` it turns into the
 * muted "Add …" prompt an empty section offers instead.
 */
function EditTrigger({
  label = '',
  text,
  onClick,
}: {
  label?: string
  text?: string
  onClick: () => void
}) {
  const muted = text ? 'text-hot-gray-400' : undefined

  return (
    <Button appearance="plain" size="small" className={muted} onClick={onClick}>
      {text}
      <Icon
        slot={text ? 'end' : undefined}
        library="bootstrap"
        name="pencil"
        // With text alongside, the button already names itself.
        label={text ? '' : label}
        className={muted}
      />
    </Button>
  )
}

/** Save/Cancel for the open section, with the save error right above them. */
function EditActions({
  onSave,
  onCancel,
  isPending,
  error,
}: {
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  error: string | null
}) {
  return (
    <div className="flex flex-col gap-2xs">
      {error && (
        <p className="text-sm text-hot-red-600 m-0" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-xs">
        <Button appearance="outlined" size="small" onClick={onCancel} disabled={isPending}>
          {m.profile_edit_cancel()}
        </Button>
        <Button size="small" onClick={onSave} disabled={isPending}>
          {isPending ? m.profile_edit_saving() : m.profile_edit_save()}
        </Button>
      </div>
    </div>
  )
}

function ProfileUserPage() {
  // The :username segment of /:locale/people/:username is the profile slug.
  const { username: slug } = useParams()
  const { currentLanguage } = useLanguage()

  const { data: profile, isLoading, error } = usePublicProfile(slug)
  const { data: me } = useMyPortalProfile()
  const updateProfile = useUpdateMyPortalProfile()

  const isMine = !!slug && me?.slug === slug

  // At most one section is open at a time; null means the whole page is read-only.
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null)
  const [form, setForm] = useState<EditForm>(EMPTY_FORM)

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
    updateProfile.reset()
    setEditingSection(section)
  }

  const cancelEditing = () => {
    updateProfile.reset()
    setEditingSection(null)
  }

  const setField = (field: EditableField, value: string) =>
    setForm((previous) => ({ ...previous, [field]: value }))

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

    for (const field of SECTION_FIELDS[section]) {
      // A cleared field has to go out as null: "" fails the backend's email and
      // LinkedIn patterns, and null is how the column is emptied.
      const next = form[field].trim() || null
      if (next !== (me?.portal[field] ?? null)) {
        patch[field] = next
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

  const contactInfo = [
    { icon: 'envelope', label: profile.contact_email },
    { icon: 'telephone', label: profile.phone },
    { icon: 'link-45deg', label: profile.linkedin_url },
  ].filter((item): item is { icon: string; label: string } => !!item.label)

  const saveError = updateProfile.error
    ? updateProfile.error instanceof PortalProfileValidationError
      ? m.profile_edit_error_validation()
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
        <span className="text-sm">People</span>
        <h1 className="text-2xl/tight break-words">{displayName}</h1>
        {editingSection === 'location' ? (
          <div className="mt-xs max-w-[320px] flex flex-col gap-xs">
            <Input
              type="text"
              size="small"
              label={m.profile_edit_location_label()}
              value={form.location}
              onInput={(e) => setField('location', e.currentTarget.value ?? '')}
            />
            <EditActions
              onSave={() => saveEditing('location')}
              onCancel={cancelEditing}
              isPending={updateProfile.isPending}
              error={saveError}
            />
          </div>
        ) : profile.location ? (
          <p className="mt-xs mb-0 text-sm flex items-center gap-2xs">
            {profile.location}
            {canEdit && (
              <EditTrigger
                label={m.profile_edit_location_button()}
                onClick={() => startEditing('location')}
              />
            )}
          </p>
        ) : (
          canEdit && (
            <p className="mt-xs mb-0 text-sm">
              <EditTrigger
                text={m.profile_add_location()}
                onClick={() => startEditing('location')}
              />
            </p>
          )
        )}
      </ProfileSectionHeader>

      <PageWrapper>
        {editingSection === 'bio' ? (
          <div className="flex flex-col gap-xs">
            <Textarea
              label={m.profile_edit_bio_label()}
              rows={6}
              value={form.bio}
              onInput={(e) => setField('bio', e.currentTarget.value ?? '')}
            />
            <EditActions
              onSave={() => saveEditing('bio')}
              onCancel={cancelEditing}
              isPending={updateProfile.isPending}
              error={saveError}
            />
          </div>
        ) : profile.bio ? (
          <div className="flex items-start gap-2xs">
            <p className="leading-relaxed">{profile.bio}</p>
            {canEdit && (
              <EditTrigger
                label={m.profile_edit_bio_button()}
                onClick={() => startEditing('bio')}
              />
            )}
          </div>
        ) : (
          canEdit && <EditTrigger text={m.profile_add_bio()} onClick={() => startEditing('bio')} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-xl">
          <div>
            {organizations.length > 0 && (
              <section className="pt-lg">
                <h2 className="text-base font-bold mb-sm">Organizations</h2>
                <ul className="flex flex-wrap gap-lg list-none p-0 m-0">
                  {organizations.map((org) => (
                    <li key={org.slug} className="flex items-center gap-xs">
                      <AvatarSquare initials={getInitials(org.name)} variant="organization" />
                      <Link
                        to={`/${currentLanguage}/org/${org.slug}`}
                        className="text-hot-gray-950 no-underline hover:underline"
                      >
                        {org.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="pt-md">
              <h2 className="text-base font-bold mb-sm">Teams</h2>
              <ul className="flex flex-wrap gap-lg list-none p-0 m-0">
                {TEAMS.map((team) => (
                  <li key={team.name} className="flex items-center gap-xs">
                    <AvatarSquare initials={team.initials} variant="team" />
                    {team.name}
                  </li>
                ))}
              </ul>
            </section>

            <section className="pt-lg">
              <div className="flex items-baseline justify-between gap-sm">
                <h2 className="text-base font-bold">Certifications</h2>
                <a href="#" className="text-sm text-hot-gray-950 underline">
                  Go to Learn
                </a>
              </div>
              <p className="text-sm text-hot-gray-600 mt-2xs mb-sm">Last certifications</p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-sm list-none p-0 m-0">
                {CERTIFICATIONS.map((certification) => (
                  <li
                    key={certification.title}
                    className="flex items-center gap-sm border border-hot-gray-200 rounded-md p-sm"
                  >
                    <span className="flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-sm bg-[#E6F6F5]">
                      <Icon src={starIcon} label="" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">{certification.title}</span>
                      <span className="block text-sm text-hot-gray-600">
                        {certification.issuer} · {certification.date}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div>
            <section>
              <h2 className="text-base font-bold mb-sm">Mapping profiles</h2>
              <ul className="list-none p-0 m-0">
                {MAPPING_PROFILES.map((profile) => (
                  <li
                    key={profile.platform}
                    className="flex items-center justify-between gap-sm border-b border-hot-gray-200 py-sm"
                  >
                    {profile.platform}
                    <a
                      href={profile.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2xs text-sm text-hot-gray-500 no-underline hover:underline"
                    >
                      {profile.handle}
                      <Icon library="bootstrap" name="arrow-up-right" label="Opens in new tab" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <div className="py-lg">
              <Button appearance="outlined">
                <Icon slot="start" library="bootstrap" name="person-vcard" label="" />
                View contact info
              </Button>
            </div>

            {(isMine || contactInfo.length > 0) && (
              <section className="mt-xl border border-dashed border-hot-gray-300 rounded-md p-md">
                <h2 className="flex items-center gap-xs text-base font-bold mb-sm">
                  <Icon library="bootstrap" name="person-vcard" label="" />
                  Contact info
                  {canEdit && contactInfo.length > 0 && (
                    <span className="ml-auto">
                      <EditTrigger
                        label={m.profile_edit_contact_button()}
                        onClick={() => startEditing('contact')}
                      />
                    </span>
                  )}
                </h2>
                {editingSection === 'contact' ? (
                  <div className="flex flex-col gap-sm">
                    <Input
                      type="email"
                      size="small"
                      label={m.profile_edit_contact_email_label()}
                      value={form.contact_email}
                      onInput={(e) => setField('contact_email', e.currentTarget.value ?? '')}
                    />
                    <Input
                      type="tel"
                      size="small"
                      label={m.profile_edit_phone_label()}
                      value={form.phone}
                      onInput={(e) => setField('phone', e.currentTarget.value ?? '')}
                    />
                    <Input
                      type="url"
                      size="small"
                      label={m.profile_edit_linkedin_url_label()}
                      value={form.linkedin_url}
                      onInput={(e) => setField('linkedin_url', e.currentTarget.value ?? '')}
                    />
                    <EditActions
                      onSave={() => saveEditing('contact')}
                      onCancel={cancelEditing}
                      isPending={updateProfile.isPending}
                      error={saveError}
                    />
                  </div>
                ) : contactInfo.length > 0 ? (
                  <ul className="flex flex-col gap-xs list-none p-0 m-0 text-sm">
                    {contactInfo.map((item) => (
                      <li key={item.label} className="flex items-center gap-xs">
                        <Icon
                          library="bootstrap"
                          name={item.icon}
                          label=""
                          className="text-hot-gray-600"
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  canEdit && (
                    <EditTrigger
                      text={m.profile_add_contact()}
                      onClick={() => startEditing('contact')}
                    />
                  )
                )}
              </section>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  )
}

export default ProfileUserPage
