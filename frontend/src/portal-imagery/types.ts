export interface IImageryProject {
  id: string;
  title: string;
  href: string;
  section: "drone";
  image: string;
}

export interface DroneProject {
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

export interface DroneApiResponse {
  results: DroneProject[];
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

export interface ApiProject {
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

export interface ApiResponse {
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
