import Card from "../../components/shared/Card";
import bg from "../../assets/images/bg.png";
import Divider from "../../components/shared/Divider";
import LinkListItem from "../../components/shared/LinkListItem";

function ImageryNoProjects() {
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
              <strong>Drone</strong>
              <br />
              Tasking Manager
            </h3>
            <Divider />
            <ul>
              <li>
                <LinkListItem
                  label="Create a new project"
                  icon="plus"
                  link="https://dronetm.org/create-project"
                />
              </li>
              <li>
                <LinkListItem
                  label="Imagery services"
                  icon="location"
                  link="https://map.openaerialmap.org/"
                />
              </li>
            </ul>
          </div>

          <div className="flex-1">
            <h3>
              <strong>OpenAerialMap</strong>
              <br />
              Image repository
            </h3>
            <Divider />
            <ul>
              <li>
                {/* TODO check links */}
                <LinkListItem
                  label="Upload new"
                  icon="upload"
                  link="https://map.openaerialmap.org/#/upload?_k=ylfplk"
                />
              </li>
              <li>
                <LinkListItem
                  label="Explore imagery"
                  icon="search"
                  link="https://map.openaerialmap.org/"
                />
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ImageryNoProjects;
