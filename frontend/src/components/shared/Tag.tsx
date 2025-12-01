import WaTag from "@awesome.me/webawesome/dist/react/tag/index.js";

export interface TagProps extends React.ComponentProps<typeof WaTag> {}

function Tag(props: TagProps) {
  return <WaTag {...props} />;
}

export default Tag;
