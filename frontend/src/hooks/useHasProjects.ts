import { useState } from 'react';

/**
 * Custom hook for development purposes to toggle hasProjects state
 * @returns {[boolean, () => void]} - hasProjects state and toggle function
 */
export function useHasProjects() {
  const [hasProjects, setHasProjects] = useState(false);

  const toggleHasProjects = () => {
    setHasProjects((prev) => !prev);
  };

  return { hasProjects, toggleHasProjects };
}
