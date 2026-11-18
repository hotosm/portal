import WaAvatar from '@awesome.me/webawesome/dist/react/avatar/index.js'

export interface AvatarProps extends React.ComponentProps<typeof WaAvatar> {}

function Avatar(props: AvatarProps) {
  return <WaAvatar {...props} />
}

export default Avatar
