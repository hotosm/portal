export interface IImageryProject {
  id: string;
  title: string;
  href: string;
  section: "drone" | "oam";
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

export interface OAMImageryResult {
  _id: string;
  uuid?: string;
  title?: string;
  provider?: string;
  contact?: string;
  bbox?: number[];
  gsd?: number;
  acquisition_start?: string;
  acquisition_end?: string;
  platform?: string;
  uploaded_at?: string;
  properties?: {
    tms?: string;
    thumbnail?: string;
  };
}

export interface OAMApiResponse {
  meta: {
    provided_by?: string;
    license?: string;
    page?: number;
    limit?: number;
    found?: number;
  };
  results: OAMImageryResult[];
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
