import { resolveLoginUrl } from "../../utils/envConfig"
import { AvatarSquareProps, GroupListProps } from "../types"
import { getInitials } from "../utils"

function AvatarSquare({
  initials,
  variant,
}: AvatarSquareProps) {
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

export function GroupList({
  title,
  groups,
  variant,
}: GroupListProps) {
  if (groups.length === 0) return null

  return (
    <>
      <h2 className="text-base font-bold mb-sm">{title}</h2>
      <ul className="flex flex-wrap gap-lg list-none p-0 m-0">
        {groups.map((group) => {
          const avatarUrl = resolveLoginUrl(group.avatar_url)

          return (
            <li key={group.slug} className="flex items-center gap-xs">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="shrink-0 w-[32px] h-[32px] rounded-sm object-cover"
                />
              ) : (
                <AvatarSquare initials={getInitials(group.name)} variant={variant} />
              )}
              {group.name}
            </li>
          )
        })}
      </ul>
    </>
  )
}