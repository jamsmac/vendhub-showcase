import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, User, Calendar } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Refill Snack Machine #04",
    machine: "Lobby Snack #04",
    type: "Refill",
    priority: "high",
    status: "pending",
    assignee: "John Doe",
    dueDate: "Today, 2:00 PM",
  },
  {
    id: 2,
    title: "Fix Coin Acceptor",
    machine: "Gym Drink #02",
    type: "Repair",
    priority: "urgent",
    status: "in-progress",
    assignee: "Mike Smith",
    dueDate: "Today, 4:00 PM",
  },
  {
    id: 3,
    title: "Monthly Cleaning",
    machine: "Office Coffee #01",
    type: "Maintenance",
    priority: "medium",
    status: "completed",
    assignee: "Sarah Johnson",
    dueDate: "Yesterday",
  },
  {
    id: 4,
    title: "Restock Cola Zero",
    machine: "Station Drink #05",
    type: "Refill",
    priority: "low",
    status: "pending",
    assignee: "John Doe",
    dueDate: "Tomorrow, 9:00 AM",
  },
  {
    id: 5,
    title: "Inspect Cooling System",
    machine: "Mall Snack #08",
    type: "Inspection",
    priority: "medium",
    status: "pending",
    assignee: "Mike Smith",
    dueDate: "Tomorrow, 11:00 AM",
  },
];

export default function Tasks() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1">Operational workflow and assignments</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            + Create Task
          </button>
        </div>

        {/* Task Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                Pending
              </h3>
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">3</span>
            </div>
            {tasks.filter(t => t.status === 'pending').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                In Progress
              </h3>
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">1</span>
            </div>
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Completed Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Completed
              </h3>
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">1</span>
            </div>
            {tasks.filter(t => t.status === 'completed').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function TaskCard({ task }: { task: any }) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-all duration-300 group cursor-pointer">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Badge 
            variant="outline" 
            className={`
              ${task.priority === 'urgent' ? 'border-rose-500/50 text-rose-400 bg-rose-500/10' : ''}
              ${task.priority === 'high' ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : ''}
              ${task.priority === 'medium' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : ''}
              ${task.priority === 'low' ? 'border-gray-500/50 text-gray-400 bg-gray-500/10' : ''}
            `}
          >
            {task.priority}
          </Badge>
          <Badge variant="secondary" className="bg-white/10 text-white border-none">
            {task.type}
          </Badge>
        </div>
        
        <div>
          <h4 className="font-bold text-white group-hover:text-primary transition-colors">{task.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{task.machine}</p>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
