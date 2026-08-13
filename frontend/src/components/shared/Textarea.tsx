import WaTextarea from '@awesome.me/webawesome/dist/react/textarea/index.js';

export type TextareaProps = React.ComponentProps<typeof WaTextarea>;

function Textarea({ ...props }: TextareaProps) {
  return <WaTextarea {...props} />;
}

export default Textarea;
