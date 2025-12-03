import { useEffect, useState } from 'react';
import { getImageryProjects, IImageryProject } from './imageryProjects';

function MyComponent() {
  const [projects, setProjects] = useState<IImageryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await getImageryProjects();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.title}</h3>
          <img src={project.image} alt={project.title} />
        </div>
      ))}
    </div>
  );
}