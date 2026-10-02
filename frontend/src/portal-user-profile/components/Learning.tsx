import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'

interface LearningProps {
  /**
   * Courses this person is taking at learn.hotosm.org, or null when there is
   * nothing to show: no account in the LMS, or it did not answer. Null is not
   * zero — claiming someone took no courses because an upstream was down
   * would be worse than saying nothing.
   */
  coursesCount: number | null | undefined
  /**
   * Courses the school offers. Shown next to the first number when known: "1"
   * says little, "1 of 18" says where someone stands.
   */
  coursesTotal: number | null | undefined
  /** Where the courses live, so the number is something you can act on. */
  learnUrl: string
}

export function Learning({
  coursesCount,
  coursesTotal,
  learnUrl,
}: LearningProps) {
  if (coursesCount === null || coursesCount === undefined) return null

  return (
    <>
      <h2 className="text-base font-bold mb-sm">{m.profile_learning_title()}</h2>
      <a
        href={learnUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-sm border border-hot-gray-100 rounded-lg p-sm no-underline text-inherit hover:border-hot-gray-300"
      >
        <span className="flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-sm bg-[#E6F6F5]">
          <Icon name="graduation-cap" variant="regular" label="" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">
            {coursesCount}
            {coursesTotal ? ` ${m.profile_learning_of()} ${coursesTotal}` : ''}{' '}
            {m.profile_learning_courses()}
          </span>
          <span className="block text-sm text-hot-gray-600">
            {m.profile_learning_subtitle()}
          </span>
        </span>
      </a>
    </>
  )
}
