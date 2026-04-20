import Icon from "./Icon";

interface CardTakeCourseProps {
  title: string;
  subtitle: string;
  href?: string;
  onClick?: () => void;
}

function CardTakeCourse({
  title,
  subtitle,
  href = "#",
  onClick,
}: CardTakeCourseProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex flex-col justify-between rounded-xl p-md h-full hover:no-underline"
      style={{
        background:
          "linear-gradient(63deg, rgb(73, 175, 172) 15%, rgb(106, 212, 217) 87%)",
      }}
    >
      <div>
        <p className="font-bold text-xl leading-tight text-white mb-0">
          {title}
        </p>
        <p className="font-normal text-xl leading-tight text-white">
          {subtitle}
        </p>
      </div>
      <div className="flex justify-end">
        <Icon
          name="arrow-right"
          className="text-2xl text-white transition-transform duration-300 group-hover:translate-x-1"
          label="Go"
        />
      </div>
    </a>
  );
}

export default CardTakeCourse;
