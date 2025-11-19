import Card from "../../components/shared/Card";
import bg from "../../assets/images/bg.png";

function ImagertNoProjects() {
  return (
    <div
      className="p-2xl rounded-lg"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <Card>
        <div className="flex flex-row gap-lg p-xl">
          <div className="flex-1">
            <h3>
              <strong>Drone</strong>
              <br />
              Tasking Manager
            </h3>

            <a href="#" target="_blank">
              Create new project
            </a>
            <a href="#" target="_blank">
              Imagery services
            </a>
          </div>

          <div className="flex-1">
            <h3>
              <strong>OpenAerialMap</strong>
              <br />
              Image repository
            </h3>
            <a href="#" target="_blank">
              Upload new
            </a>
            <a href="#" target="_blank">
              Explore imagery
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ImagertNoProjects;
