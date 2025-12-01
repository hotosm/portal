import { m } from "../../paraglide/messages";

type Props = { projects: any[] };

function YourProjectsTitle({ projects }: Props) {
  const isPlural = projects.length > 1;
  return (
    <div className="text-lg">
      {isPlural ? (
        <>
          {m.your_plural()} <strong>{m.projects()}</strong>
        </>
      ) : (
        <>
          {m.your_singular()} <strong>{m.project()}</strong>
        </>
      )}
    </div>
  );
}

export default YourProjectsTitle;
