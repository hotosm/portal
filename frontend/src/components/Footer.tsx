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
      <div className="bg-hot-gray-50 py-3xl">
        <div className="container grid grid-cols-2 sm:grid-cols-4 gap-2xl">
          {categories.map((category) => (
            <div key={category.name}>
              <p
                className="text-xl font-bold mb-md leading-tight"
                style={{ fontFamily: "Barlow, sans-serif" }}
              >
                {category.name}
              </p>
              <ul className="list-none p-0 m-0 flex flex-col gap-xs">
                {category.tools.map((tool) => (
                  <li key={tool}>
                    <span
                      className="text-lg text-hot-gray-1000"
                      style={{ fontFamily: "'Barlow Narrow', sans-serif" }}
                    >
                      {tool}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-hot-gray-950 py-xl">
        <div className="container flex justify-between items-center gap-md">
          <img
            src={hotLogo}
            alt="HOT Logo"
            className="h-[34px] brightness-0 invert"
          />
          <p
            className="text-sm text-hot-gray-100 text-right m-0 max-w-sm"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            This is free and open source software, brought to you by the
            Humanitarian OpenStreetMap Team &amp; friends
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
