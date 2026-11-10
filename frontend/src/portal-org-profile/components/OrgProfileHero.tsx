import { useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import Dropdown from '../../components/shared/Dropdown'
import DropdownItem from '../../components/shared/DropdownItem'
import Icon from '../../components/shared/Icon'
import orgPlaceholder from '../../assets/images/org-placeholder.svg'
import { m } from '../../paraglide/messages'
import type { OrgProfileHeroProps } from '../types'

/**
 * Full-width banner at the top of an org's public profile: name, tagline and
 * the video/share actions over the org's banner image.
 */
function OrgProfileHero({
  name,
  tagline,
  taglineLang,
  bannerUrl,
  videoId,
  videoLang,
  contentLang,
  uiLang,
}: OrgProfileHeroProps) {
  const [videoOpen, setVideoOpen] = useState(false)
  const videoTitle = m.org_profile_video_title({ name })

  // The public profile URL is whatever the visitor is already looking at,
  // `?lang=` included when the content language was picked.
  const share = (event: CustomEvent) => {
    if (event.detail.item.value === 'copy-link') {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success(m.org_profile_link_copied()))
        .catch(() => {})
    }
  }

  return (
    <section
      lang={contentLang}
      className={`relative flex flex-col justify-end min-h-[360px] lg:min-h-[520px] bg-hot-gray-200 ${
        bannerUrl ? 'bg-cover bg-center' : 'bg-no-repeat bg-right'
      }`}
      style={{ backgroundImage: `url(${bannerUrl || orgPlaceholder})` }}
    >
      {/* Darker towards the bottom-left, where the text sits */}
      <div
        aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--hot-color-blue-950)_15%,transparent)] to-[color-mix(in_srgb,var(--hot-color-blue-950)_92%,transparent)]"

      />

      <div className="container relative py-2xl flex flex-col gap-md">
        <h1 className="text-3xl lg:text-5xl font-semibold text-white break-words">{name}</h1>
        {tagline && (
          <p lang={taglineLang} className="text-lg text-white/90 max-w-[60ch] break-words">
            {tagline}
          </p>
        )}

        <div lang={uiLang} className="flex flex-wrap gap-sm mt-sm">
          {videoId && (
            <Button variant="neutral" appearance="accent" onClick={() => setVideoOpen(true)}>
              <Icon slot="start" name="video" label="" />
              {m.org_profile_see_video()}
            </Button>
          )}
          <Dropdown onSelect={share}>
            <Button slot="trigger" variant="neutral" appearance="accent">
              <Icon slot="start" name="share-nodes" label="" />
              {m.org_profile_share()}
            </Button>
            <DropdownItem value="copy-link">
              <Icon slot="icon" name="link" label="" />
              {m.org_profile_copy_link()}
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {videoId && (
        <Dialog
          lang={uiLang}
          open={videoOpen}
          label={videoTitle}
          style={{ '--width': 'min(960px, 92vw)' } as React.CSSProperties}
          onWaHide={(e) => {
            if (e.target === e.currentTarget) setVideoOpen(false)
          }}
        >
          {/* Only mounted while open, so the player loads (and stops) with the dialog */}
          {videoOpen && (
            <div lang={videoLang}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={videoTitle}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full aspect-video rounded-lg border-0"
              />
            </div>
          )}
        </Dialog>
      )}
    </section>
  )
}

export default OrgProfileHero
