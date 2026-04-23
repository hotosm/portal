import type { FieldTMProject } from "../types";

// TODO: wire up when the Field TM API endpoint is available
export function useFieldTMProjects(): { data: FieldTMProject[]; isLoading: boolean } {
  return { data: [], isLoading: false };
}
