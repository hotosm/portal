function Footer() {
  return (
    <footer className="bg-hot-gray-50 py-3xl">
      <div className="container">
        {/* TODO update footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">About HOT</h3>
            <p className="text-sm mb-4">
              HOT is an international team dedicated to humanitarian action and
              community development through open mapping.
            </p>
            <a
              href="https://www.hotosm.org/what-we-do"
              className="text-hot-primary-400 text-sm font-medium"
            >
              Learn what we do →
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  What we do
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Our work
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Tools & Data
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  News
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Open Mapping Hubs
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Get involved
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Start mapping
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Partner with us
                </a>
              </li>
              <li>
                <a href="#" className="text-hot-neutral-300 text-sm">
                  Community & Organization
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-hot-neutral-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-hot-neutral-400 mb-4 md:mb-0">
              Humanitarian OpenStreetMap Team is a 501(c)(3) not-for-profit
              organization and global community. Learn more about OpenStreetMap.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-hot-neutral-400 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-hot-neutral-400 text-sm">
                Terms of Use
              </a>
              <a href="#" className="text-hot-neutral-400 text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
