// Get Drone-TM frontend URL from environment (defaults to production)
const DRONE_TM_URL = import.meta.env.VITE_DRONE_TM_URL || 'https://dronetm.org';

export interface IImageryProject {
  id: number;
  title: string;
  href: string;
  section: "drone" | "oam";
  image: string;
}

interface ApiProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  status: string;
  total_task_count: number;
  ongoing_task_count: number;
  completed_task_count: number;
}

interface ApiResponse {
  results: ApiProject[];
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    next_num: number | null;
    prev_num: number | null;
    page: number;
    per_page: number;
    total: number;
  };
}

export async function getImageryProjects(): Promise<IImageryProject[]> {
  try {
    const response = await fetch('/api/drone-tasking-manager/projects/user', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    
    return data.results.map((project, index) => ({
      id: index + 1,
      title: project.name,
      href: `${DRONE_TM_URL}/projects/${project.id}`,
      section: "drone" as const,
      image: project.image_url,
    }));
  } catch (error) {
    console.error('Error fetching imagery projects:', error);
    throw error;
  }
}

export async function getAllImageryProjects(): Promise<IImageryProject[]> {
  let allProjects: IImageryProject[] = [];
  let page = 1;
  let hasNext = true;

  try {
    while (hasNext) {
      const response = await fetch(
        `/api/drone-tasking-manager/projects/user?page=${page}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      const projects = data.results.map((project, index) => ({
        id: allProjects.length + index + 1,
        title: project.name,
        href: `${DRONE_TM_URL}/projects/${project.id}`,
        section: "drone" as const,
        image: project.image_url,
      }));
      
      allProjects = [...allProjects, ...projects];
      hasNext = data.pagination.has_next;
      page++;
    }
    
    return allProjects;
  } catch (error) {
    console.error('Error fetching all imagery projects:', error);
    throw error;
  }
}