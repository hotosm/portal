import Button from '../../components/shared/Button'
import Icon from '../../components/shared/Icon'
import Input from '../../components/shared/Input'
import { m } from '../../paraglide/messages'
import { CONTACT_FIELDS, EXTRA_LINKS_MAX, EXTRA_LINK_MAXLENGTH } from '../constants'
import { usePublicContact } from '../hooks/usePublicProfile'
import type { ContactInfoProps } from '../types'
import { contactHref, formatLinkLabel } from '../utils'
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
  extraLinksDraft,
  onExtraLinkChange,
  onAddExtraLink,
  onRemoveExtraLink,
  extraLinkErrors,
  extraLinksError,
  isEditing,
  canEdit,
  isPending,
  saveError,
  onStartEditing,
  onSave,
  onCancel,
}: ContactInfoProps) {
  // Visitors get the contact details straight away, from their own endpoint.
  const canLoadContact = !isOwnerUnknown && !isMine && hasContact
  const publicContact = usePublicContact(slug, canLoadContact)

  const contact = isMine ? ownContact : publicContact.data
  const contactRows = CONTACT_FIELDS.map((item) => ({ ...item, value: contact?.[item.field] }))
  const contactInfo = contactRows.filter((item) => !!item.value)
  const extraLinks = contact?.extra_links ?? []
  const hasContactInfo = contactInfo.length > 0 || extraLinks.length > 0

  const contactError = canLoadContact && !!publicContact.error
  const showVisitorContact =
    canLoadContact && !publicContact.isPending && (contactError || hasContactInfo)

  return (
    <>
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
              hasContactInfo && (
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
                {extraLinksDraft.map((link, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: draft rows are plain strings with no identity; inputs are controlled.
                  <li key={index} className="flex items-center gap-xs ml-0 min-h-[38px]">
                    <Icon
                      name="link"
                      variant="solid"
                      label=""
                      className="text-hot-gray-800 shrink-0"
                    />
                    <Input
                      type="url"
                      size="small"
                      className="profile-edit-field visually-hidden-label flex-1 min-w-0"
                      label={m.profile_edit_extra_link_label()}
                      placeholder={m.profile_edit_extra_link_placeholder()}
                      customError={extraLinkErrors[index] ?? null}
                      hint={extraLinkErrors[index]}
                      maxlength={EXTRA_LINK_MAXLENGTH}
                      value={link}
                      onInput={(e) => onExtraLinkChange(index, e.currentTarget.value ?? '')}
                    />
                    <Button
                      appearance="plain"
                      size="small"
                      onClick={() => onRemoveExtraLink(index)}
                    >
                      <Icon name="xmark" variant="solid" label={m.profile_remove_link()} />
                    </Button>
                  </li>
                ))}
              </ul>
              {extraLinksDraft.length < EXTRA_LINKS_MAX && (
                <div className="mt-xs">
                  <Button appearance="plain" size="small" onClick={onAddExtraLink}>
                    <Icon slot="start" name="plus" variant="solid" label="" />
                    {m.profile_add_link()}
                  </Button>
                </div>
              )}
              <div>
                <EditError error={extraLinksError} />
                <EditError error={saveError} />
              </div>
            </>
          ) : contactError ? (
            <p className="text-sm text-hot-gray-600 m-0" role="alert">
              {m.profile_contact_error()}
            </p>
          ) : hasContactInfo ? (
            <ul className="flex flex-col gap-xs list-none p-0 m-0 text-sm">
              {(isMine ? contactRows : contactInfo).map((item) => (
                <li key={item.field} className="flex items-center gap-xs ml-0 h-[38px] min-w-0">
                  <Icon
                    name={item.icon}
                    variant={item.variant}
                    label=""
                    className="text-hot-gray-800 shrink-0"
                  />
                  {item.value ? (
                    <a href={contactHref(item.field, item.value)} className="truncate min-w-0">
                      {item.value}
                    </a>
                  ) : (
                    canEdit && (
                      <span className="text-hot-gray-600">
                        <i>{item.addText()}</i>
                      </span>
                    )
                  )}
                </li>
              ))}
              {extraLinks.map((url) => (
                <li key={url} className="flex items-center gap-xs ml-0 h-[38px] min-w-0">
                  <Icon
                    name="link"
                    variant="solid"
                    label=""
                    className="text-hot-gray-800 shrink-0"
                  />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    className="truncate min-w-0"
                  >
                    {formatLinkLabel(url)}
                  </a>
                </li>
              ))}
              {isMine && extraLinks.length === 0 && (
                <li className="flex items-center gap-xs ml-0 h-[38px]">
                  <Icon
                    name="link"
                    variant="solid"
                    label=""
                    className="text-hot-gray-800 shrink-0"
                  />
                  {canEdit && (
                    <span className="text-hot-gray-600">
                      <i>{m.profile_add_link()}</i>
                    </span>
                  )}
                </li>
              )}
            </ul>
          ) : (
            canEdit && <EditTrigger text={m.profile_add_contact()} onClick={onStartEditing} />
          )}
        </section>
      )}
    </>
  )
}
