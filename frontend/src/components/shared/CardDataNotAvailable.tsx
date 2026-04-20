import Icon from "./Icon";

function CardDataNotAvailable() {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-dashed border-hot-gray-300 p-md flex flex-col gap-md">
      <Icon name="circle-info" label="Info" className="text-hot-gray-400 text-xl" />
      <div>
        <p className="font-bold text-base leading-tight">User data not available yet</p>
        <p className="text-hot-gray-500 text-sm mt-1">Coming soon, stay tuned.</p>
      </div>
    </div>
  );
}

export default CardDataNotAvailable;
