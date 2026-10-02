import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'
import type { PublicProfileCourse } from '../hooks/usePublicProfile'

interface LearningProps {
  /**
   * Courses this person is taking at learn.hotosm.org, finished ones first.
   * Null when there is nothing to show — no account in the LMS, or it did not
   * answer — which is not the same as an empty list.
   */
  courses: PublicProfileCourse[] | null | undefined
  /** How many they are enrolled in, which can exceed the ones listed above. */
  coursesCount: number | null | undefined
  /** Whole hours spent learning; absent below one. */
  hours: number | null | undefined
  /** Where the courses live, so the list is something you can act on. */
  learnUrl: string
}

export function Learning({
  courses,
  coursesCount,
  hours,
  learnUrl,
}: LearningProps) {
  if (!courses || courses.length === 0) return null

  // Only the ones beyond what is listed; "and 0 more" is noise.
  const notListed = (coursesCount ?? courses.length) - courses.length

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

      <ul className="flex flex-col gap-xs list-none p-0 m-0">
        {courses.map((course) => {
          const done = course.status === 'completed'

          return (
            <li
              key={course.title}
              className="m-0 flex items-center gap-sm border border-hot-gray-100 rounded-lg p-sm"
            >
              <span
                className={`flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-sm ${
                  done ? 'bg-[#E6F6F5]' : 'bg-hot-gray-100'
                }`}
              >
                <Icon
                  name={done ? 'circle-check' : 'graduation-cap'}
                  variant="regular"
                  label=""
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-bold">{course.title}</span>
                {/* Finished work says "completed"; anything else shows how far
                    along it is, which is the honest version of the same fact. */}
                {done ? (
                  <span className="block text-sm text-hot-gray-600">
                    {m.profile_learning_completed()}
                  </span>
                ) : (
                  <span className="flex items-center gap-xs mt-2xs">
                    <span
                      className="h-[4px] flex-1 rounded-full bg-hot-gray-100 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={course.progress_rate}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={course.title}
                    >
                      <span
                        className="block h-full bg-hot-red-600"
                        style={{ width: `${course.progress_rate}%` }}
                      />
                    </span>
                    <span className="text-sm text-hot-gray-600 shrink-0">
                      {course.progress_rate}%
                    </span>
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>

      {(notListed > 0 || hours) && (
        <p className="text-sm text-hot-gray-500 mt-sm">
          {notListed > 0 && `+${notListed} ${m.profile_learning_more()}`}
          {notListed > 0 && hours ? ' · ' : ''}
          {hours ? `${hours} ${m.profile_learning_hours()}` : ''}
        </p>
      )}
    </>
  )
}
