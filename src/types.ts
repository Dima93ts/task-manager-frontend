export interface Task {
  id: number;
  clientName: string;
  projectName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  estimatedHours: number;
}
