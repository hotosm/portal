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

/**
 * A handful of counts, written as a sentence rather than drawn.
 *
 * Three small numbers in a bordered panel left most of the row empty and the
 * meter beside them read as an underline. At this size the numbers are the
 * whole content: emphasised in the line, with the certificates below carrying
 * the visual weight.
 */
export function Learning({
  courses,
  coursesCount,
  hours,
  learnUrl,
}: LearningProps) {
  if (!courses || courses.length === 0) return null

  const completed = courses.filter((c) => c.status === 'completed').length
  const enrolled = coursesCount ?? courses.length

  const stats = [
    {
      value: enrolled,
      label: enrolled === 1 ? m.profile_learning_enrolled_one() : m.profile_learning_enrolled(),
    },
    completed > 0 && {
      value: completed,
      label: completed === 1 ? m.profile_learning_done_one() : m.profile_learning_done(),
    },
    hours
      ? {
          value: hours,
          label: hours === 1 ? m.profile_learning_hours_one() : m.profile_learning_hours(),
        }
      : null,
  ].filter(Boolean) as { value: number; label: string }[]

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

      {/* The link above already names the school; repeating it here and
          again under the certificates reads as filler. */}
      <p className="text-hot-gray-600 mt-2xs">
        {stats.map((stat, index) => (
          <span key={stat.label}>
            {index > 0 && <span className="mx-2xs text-hot-gray-300">·</span>}
            <span className="font-bold text-hot-gray-950">{stat.value}</span>{' '}
            {stat.label}
          </span>
        ))}
      </p>
    </>
  )
}
