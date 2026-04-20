import hotLogo from "../assets/images/hot-logo.svg";
function Footer() {
  return (
    <footer className="bg-hot-gray-50">
      <div className="container flex flex-col sm:flex-row justify-between items-center py-lg gap-md">
        <img
          src={hotLogo}
          alt="HOT Logo"
          className="h-[34px] w-[178px] grayscale"
        />
        <span className="text-xs text-end">
          Humanitarian OpenStreetMap Team is a 501(c)(3)
          <br /> not-for-profit organization and global community.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
