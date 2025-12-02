export type TicketType = "Story" | "Task" | "Bug" | "Epic" | "Feature";
export type TicketPriority = "P0" | "P1" | "P2" | "P3";
export type TicketEffort = "XS" | "S" | "M" | "L" | "XL";

export type Ticket = {
  id: string;
  title: string;
  type: TicketType;
  priority: TicketPriority;
  description: string;
  acceptanceCriteria: string[];
  estimatedEffort: TicketEffort;
  dependencies: string[];
  labels: string[];
};
