import Button from '../../components/shared/Button'
import PageWrapper from '../../components/shared/PageWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { m } from '../../paraglide/messages'
import { useMyGroups } from '../../portal-plans/hooks'
import { ProfileSectionHeaderProps } from '../types'


function ProfileSectionHeader({
  children,
  buttonText,
  buttonLink,
  onButtonClick,
  menu,
}: ProfileSectionHeaderProps) {
  const label = buttonText
  const { user } = useAuth()
  const { data: groups } = useMyGroups()


  return (
    <div
      style={{
        background: 'linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)',
      }}
    >
      <PageWrapper>
        <div
          className="flex flex-col md:flex-row gap-sm w-full justify-between items-start md:items-center" >
            <div className="break-words min-w-0 w-full md:w-auto grow">{children}</div>
          {menu ??
            ((label || buttonLink) && (
              <Button href={buttonLink} onClick={onButtonClick}>
                {label}
              </Button>
            ))}
        </div>
      </PageWrapper>
    </div>
  )
}

export default ProfileSectionHeader
