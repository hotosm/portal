import Card from "../../components/shared/Card";
import bg from "../../assets/images/bg.png";
import Divider from "../../components/shared/Divider";
import LinkListItem from "../../components/shared/LinkListItem";

function DataNoProjects() {
  return (
    <div
      className="p-md md:p-2xl rounded-lg"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <Card>
        <div className="flex flex-col lg:flex-row gap-2xl p-0 md:p-xl">
          <div className="flex-1">
            <h3>
              <strong>uMap</strong>
              <br />
            </h3>
            <Divider />
          </div>

          <div className="flex-1">
            <h3>
              <strong>Export Tool</strong>
              <br />
            </h3>
            <Divider />
            <ul>
              <li>
                <LinkListItem
                  label="Start exporting"
                  icon="file-export"
                  link="https://export.hotosm.org/v3/exports/new"
                />
              </li>
              <li>
                <LinkListItem
                  label="Quick start guide"
                  icon="chalkboard"
                  link="https://export.hotosm.org/v3/learn/quick_start"
                />
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DataNoProjects;
