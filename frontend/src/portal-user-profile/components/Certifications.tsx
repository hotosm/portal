import Icon from "../../components/shared/Icon";
import { CERTIFICATIONS } from "../constants";

export function Certifications() {
  return <>
  <div className="flex items-baseline justify-between gap-sm">
                <h2 className="text-base font-bold">Certifications</h2>
              </div>
              <p className="text-sm text-hot-gray-600 mt-2xs mb-sm">Last certifications</p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-sm list-none p-0 m-0">
                {CERTIFICATIONS.map((certification) => (
                  <li
                    key={certification.title}
                    className="m-0 flex items-center gap-sm border border-hot-gray-100 rounded-lg p-sm"
                  >
                    <span className="flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-sm bg-[#E6F6F5]">
                      <Icon name="star" variant="regular" label="" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">{certification.title}</span>
                      <span className="block text-sm text-hot-gray-600">
                        {certification.date}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              </>
}