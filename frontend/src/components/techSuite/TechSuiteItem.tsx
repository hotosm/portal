import { motion } from "motion/react";

interface ITechSuiteItemProps {
  title: string;
  description: string;
  icon: any;
}

function TechSuiteItem({ title, description, icon }: ITechSuiteItemProps) {
  console.log(icon);
  return (
    <motion.div
      className="group flex flex-col justify-center items-center text-center hover:cursor-pointer"
      whileHover="hover"
    >
      <motion.img
        src={icon}
        alt="Product vector icon"
        style={{
          height: "100px",
          width: "100px",
          margin: "0 auto",
        }}
        variants={{
          hover: { scale: 1.1 },
        }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
      />
      <p className="m-xs">
        <span className="text-white text-lg uppercase px-sm bg-hot-red-600 group-hover:bg-hot-red-400 transition-opacity rounded-sm pb-[2px]">
          {title}
        </span>
      </p>
      <p className="max-w-[300px]">{description}</p>
    </motion.div>
  );
}

export default TechSuiteItem;
