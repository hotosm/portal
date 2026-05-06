import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Icon from "../../components/shared/Icon";
import { useLanguage } from "../../contexts/LanguageContext";
import { m } from "../../paraglide/messages";
import type { PlanReadHydrated } from "../types";

interface PlanShareButtonProps {
  plan: PlanReadHydrated;
}

function PlanShareButton({ plan }: PlanShareButtonProps) {
  const { currentLanguage } = useLanguage();
  const [shareOpen, setShareOpen] = useState(false);

  const planUrl = useMemo(
    () => `${window.location.origin}/${currentLanguage}/plan/${plan.id}`,
    [currentLanguage, plan.id],
  );

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(planUrl);
      toast.success(m.plan_toast_link_copied());
    } catch {
      toast.error(m.plan_toast_link_copy_error());
    }
  }, [planUrl]);

  const onNativeShare = useCallback(() => {
    navigator.share({ title: plan.name, url: planUrl }).catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(m.plan_toast_share_error());
    });
  }, [plan.name, planUrl]);

  return (
    <div>
      <Button type="button" onClick={() => setShareOpen(true)}>
        <Icon slot="start" library="bootstrap" name="share" />
        {m.plan_menu_share()}
      </Button>

      <Dialog
        open={shareOpen}
        label={m.plan_share_dialog_label()}
        onWaHide={() => setShareOpen(false)}
      >
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm bg-hot-gray-50 rounded-lg px-sm py-xs text-sm text-hot-gray-600 break-all">
            <Icon library="bootstrap" name="link-45deg" />
            <span className="flex-1">{planUrl}</span>
          </div>
          <div className="flex gap-sm">
            <Button
              type="button"
              appearance="outlined"
              onClick={onCopyLink}
              className="flex-1"
            >
              <Icon slot="start" library="bootstrap" name="clipboard" />
              {m.plan_share_copy_link()}
            </Button>
            {typeof navigator.share === "function" && (
              <Button
                type="button"
                appearance="outlined"
                onClick={onNativeShare}
                className="flex-1"
              >
                <Icon slot="start" library="bootstrap" name="share" />
                {m.plan_share_native()}
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default PlanShareButton;
