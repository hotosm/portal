import { useState } from 'react'
import Button from '../../components/shared/Button'
import Icon from '../../components/shared/Icon'
import Input from '../../components/shared/Input'
import { m } from '../../paraglide/messages'
import { CONTACT_FIELDS } from '../constants'
import { usePublicContact } from '../hooks/usePublicProfile'
import type { ContactInfoProps } from '../types'
import { EditActions, EditError, EditTrigger } from './EditActions'

export function ContactInfo({
  slug,
  isMine,
  isOwnerUnknown,
  hasContact,
  ownContact,
  draft,
  onDraftChange,
  fieldErrors,
  isEditing,
  canEdit,
  isPending,
  saveError,
  onStartEditing,
  onSave,
  onCancel,
}: ContactInfoProps) {
  const [revealedSlug, setRevealedSlug] = useState<string | null>(null)
  const contactRevealed = !!slug && revealedSlug === slug
  const publicContact = usePublicContact(slug, contactRevealed && !isMine)

  const contact = isMine ? ownContact : publicContact.data
  const contactRows = CONTACT_FIELDS.map((item) => ({ ...item, value: contact?.[item.field] }))
  const contactInfo = contactRows.filter((item) => !!item.value)

  const canRevealContact = !isOwnerUnknown && !isMine && hasContact
  const showRevealButton = canRevealContact && (!contactRevealed || publicContact.isPending)
  const contactError = canRevealContact && contactRevealed && !!publicContact.error
  const showVisitorContact =
    canRevealContact &&
    contactRevealed &&
    !publicContact.isPending &&
    (contactError || contactInfo.length > 0)

  return (
    <>
      {showRevealButton && (
        <div className="py-lg">
          <Button loading={contactRevealed} onClick={() => setRevealedSlug(slug ?? null)}>
            <Icon slot="start" family="classic" variant="regular" name="contact-book" />
            {m.profile_view_contact()}
          </Button>
        </div>
      )}

      {(isMine || showVisitorContact) && (
        <section className="border border-dashed border-hot-gray-300 rounded-md p-md">
          <h2 className="flex items-center gap-xs text-base font-bold mb-sm h-[38px]">
            <Icon slot="start" family="classic" variant="regular" name="contact-book" />
            Contact info
            {isEditing ? (
              <span className="ml-auto">
                <EditActions onSave={onSave} onCancel={onCancel} isPending={isPending} />
              </span>
            ) : (
              canEdit &&
              contactInfo.length > 0 && (
                <span className="ml-auto">
                  <EditTrigger label={m.profile_edit_contact_button()} onClick={onStartEditing} />
                </span>
              )
            )}
          </h2>

          {isEditing ? (
            <>
              <ul className="flex flex-col gap-xs list-none p-0 m-0 text-sm">
                {CONTACT_FIELDS.map((item) => (
                  <li key={item.field} className="flex items-center gap-xs ml-0 min-h-[38px]">
                    <Icon
                      name={item.icon}
                      variant={item.variant}
                      label=""
                      className="text-hot-gray-800 shrink-0"
                    />
                    <Input
                      type={item.type}
                      size="small"
                      className="profile-edit-field visually-hidden-label flex-1 min-w-0"
                      label={item.label()}
                      placeholder={item.label()}
                      customError={fieldErrors[item.field] ?? null}
                      hint={fieldErrors[item.field]}
                      maxlength={item.maxlength}
                      value={draft[item.field]}
                      onInput={(e) => onDraftChange(item.field, e.currentTarget.value ?? '')}
                    />
                  </li>
                ))}
              </ul>
              <div>
                <EditError error={saveError} />
              </div>
            </>
          ) : contactError ? (
            <p className="text-sm text-hot-gray-600 m-0" role="alert">
              {m.profile_contact_error()}
            </p>
          ) : contactInfo.length > 0 ? (
            <ul className="flex flex-col gap-xs list-none p-0 m-0 text-sm">
              {(isMine ? contactRows : contactInfo).map((item) => (
                <li key={item.field} className="flex items-center gap-xs ml-0 h-[38px]">
                  <Icon
                    name={item.icon}
                    variant={item.variant}
                    label=""
                    className="text-hot-gray-800"
                  />
                  {item.value ||
                    (canEdit && (
                      <span className="text-hot-gray-600">
                        <i>{item.addText()}</i>
                      </span>
                    ))}
                </li>
              ))}
            </ul>
          ) : (
            canEdit && <EditTrigger text={m.profile_add_contact()} onClick={onStartEditing} />
          )}
        </section>
      )}
    </>
  )
}
