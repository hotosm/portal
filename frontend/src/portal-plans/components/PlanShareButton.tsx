import { useState } from 'react'
import Button from '../../components/shared/Button'
import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'
import type { PlanReadHydrated } from '../types'
import PlanShareDialog from './PlanShareDialog'

interface PlanShareButtonProps {
  plan: PlanReadHydrated
}

function PlanShareButton({ plan }: PlanShareButtonProps) {
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div>
      <Button type="button" onClick={() => setShareOpen(true)}>
        <Icon slot="start" library="bootstrap" name="share" />
        {m.plan_menu_share()}
      </Button>

      <PlanShareDialog plan={plan} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}

export default PlanShareButton
