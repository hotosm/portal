import hotLogo from "../assets/images/hot-logo.svg";

const categories = [
  {
    name: "Imagery",
    tools: ["Drone Tasking Manager", "OpenAerialMap"],
  },
  {
    name: "Mapping",
    tools: ["Tasking Manager", "fAIr"],
  },
  {
    name: "Field",
    tools: ["Field Tasking Manager", "ChatMap"],
  },
  {
    name: "Data",
    tools: ["Export Tool", "uMap"],
  },
];

function Footer() {
  return (
    <footer>
      <div className="py-3xl border-t border-gray-100">
        <div className="container grid grid-cols-2 sm:grid-cols-4 gap-2xl">
          {categories.map((category) => (
            <div key={category.name}>
              <p className="text-xl font-bold mb-md">{category.name}</p>
              <ul className="list-none p-0 m-0 flex flex-col">
                {category.tools.map((tool) => (
                  <li key={tool}>
                    <span className="text-lg">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-hot-gray-50 py-xl">
        <div className="container flex justify-between items-center gap-md">
          <img
            src={hotLogo}
            alt="HOT Logo"
            className="h-[38px] [filter:brightness(0)_invert(0.4)]"
          />
          <p className="text-hot-gray-600 text-right m-0 max-w-sm">
            This is free and open source software, brought to you by the
            Humanitarian OpenStreetMap Team &amp; friends
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
