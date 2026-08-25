import WaInput from '@awesome.me/webawesome/dist/react/input/index.js';

export type InputProps = React.ComponentProps<typeof WaInput>;

function Input({ ...props }: InputProps) {
  return <WaInput {...props} />;
}

export default Input;
