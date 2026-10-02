import { m } from '../../paraglide/messages'
import type { PublicProfileCourse } from '../hooks/usePublicProfile'

interface LearningProps {
  /**
   * Courses this person is taking at learn.hotosm.org. Null when there is
   * nothing to show — no account in the LMS, or it did not answer — which is
   * not the same as an empty list.
   */
  courses: PublicProfileCourse[] | null | undefined
  /** How many they are enrolled in, which can exceed the ones detailed above. */
  coursesCount: number | null | undefined
  /** Whole hours spent learning; absent below one. */
  hours: number | null | undefined
  /** Where the courses live, so the numbers lead somewhere. */
  learnUrl: string
}

interface StatProps {
  value: number
  label: string
}

/**
 * One headline number. A handful of counts is a row of these, not a chart: a
 * two-slice donut or a one-bar chart says less and takes more room.
 *
 * Proportional figures on purpose — `tabular-nums` gives every digit the width
 * of a zero, which reads loose at this size.
 */
function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-hot-gray-950 leading-none">
        {value}
      </span>
      <span className="text-sm text-hot-gray-600 mt-2xs">{label}</span>
    </div>
  )
}

export function Learning({
  courses,
  coursesCount,
  hours,
  learnUrl,
}: LearningProps) {
  if (!courses || courses.length === 0) return null

  const completed = courses.filter((c) => c.status === 'completed').length
  const inProgress = courses.filter((c) => c.status === 'in_progress').length
  const enrolled = coursesCount ?? courses.length
  // Of the courses we know about, how many are finished. One ratio against a
  // limit: a meter, with the unfilled part a lighter step of the same ramp.
  const share = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0

  return (
    <>
      <div className="flex items-baseline justify-between gap-sm">
        <h2 className="text-base font-bold">{m.profile_learning_title()}</h2>
        <a
          href={learnUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-hot-gray-600 hover:text-hot-red-600"
        >
          {m.profile_learning_visit()}
        </a>
      </div>
      <p className="text-sm text-hot-gray-600 mt-2xs mb-sm">
        {m.profile_learning_subtitle()}
      </p>

      <div className="border border-hot-gray-100 rounded-lg p-sm">
        <div className="flex flex-wrap gap-xl">
          <Stat value={enrolled} label={m.profile_learning_enrolled()} />
          {completed > 0 && (
            <Stat value={completed} label={m.profile_learning_completed()} />
          )}
          {inProgress > 0 && (
            <Stat value={inProgress} label={m.profile_learning_in_progress()} />
          )}
          {hours ? <Stat value={hours} label={m.profile_learning_hours()} /> : null}
        </div>

        {/* Only once something is finished: a meter at 0% says nothing and
            reads as a judgement. */}
        {completed > 0 && (
          <div className="mt-sm">
            <div
              className="h-[6px] rounded-full bg-hot-red-50 overflow-hidden"
              role="progressbar"
              aria-valuenow={share}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={m.profile_learning_completed()}
            >
              <div
                className="h-full rounded-full bg-hot-red-600"
                style={{ width: `${share}%` }}
              />
            </div>
            {/* Direct label rather than a legend: one series, named here. */}
            <p className="text-sm text-hot-gray-600 mt-2xs">
              {share}% {m.profile_learning_of_your_courses()}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
