import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, AlertCircle, User, Calendar, Plus, GripVertical, Search } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Task {
  id: number;
  title: string;
  description?: string;
  machineId?: number;
  machine?: string;
  type: string;
  priority: string;
  status: string;
  assignee?: string;
  assignedTo?: number;
  dueDate?: string;
  createdAt?: string;
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Пополнить автомат снеками",
    description: "Необходимо пополнить запасы снеков в автомате в лобби",
    machine: "Lobby Snack #04",
    type: "Пополнение",
    priority: "high",
    status: "pending",
    assignee: "Иван Иванов",
    dueDate: "Сегодня, 14:00",
  },
  {
    id: 2,
    title: "Ремонт монетоприемника",
    description: "Монетоприемник не принимает 10-рублевые монеты",
    machine: "Gym Drink #02",
    type: "Ремонт",
    priority: "urgent",
    status: "in-progress",
    assignee: "Михаил Смирнов",
    dueDate: "Сегодня, 16:00",
  },
  {
    id: 3,
    title: "Ежемесячная чистка",
    description: "Плановая ежемесячная чистка и дезинфекция",
    machine: "Office Coffee #01",
    type: "Обслуживание",
    priority: "medium",
    status: "completed",
    assignee: "Сара Джонсон",
    dueDate: "Вчера",
  },
  {
    id: 4,
    title: "Пополнить Кока-Колу Зеро",
    description: "Закончились запасы Кока-Колы Зеро",
    machine: "Station Drink #05",
    type: "Пополнение",
    priority: "low",
    status: "pending",
    assignee: "Иван Иванов",
    dueDate: "Завтра, 9:00",
  },
  {
    id: 5,
    title: "Проверка системы охлаждения",
    description: "Плановая проверка работы системы охлаждения",
    machine: "Mall Snack #08",
    type: "Инспекция",
    priority: "medium",
    status: "pending",
    assignee: "Михаил Смирнов",
    dueDate: "Завтра, 11:00",
  },
];

export default function Tasks() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "Пополнение",
    priority: "medium",
    assignee: "",
  });

  const { data: tasks = [], isLoading } = trpc.tasks.list.useQuery();
  const utils = trpc.useUtils();
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
  });

  // Use mock data if no real data
  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as string;

    // Find the task being dragged
    const task = displayTasks.find((t: Task) => t.id === taskId);
    if (!task) return;

    // If status hasn't changed, do nothing
    if (task.status === newStatus) return;

    // Update task status via API
    updateTaskMutation.mutate({
      id: taskId,
      status: newStatus,
    });

    // Show success toast
    const statusLabels: Record<string, string> = {
      pending: "Ожидание",
      "in-progress": "В работе",
      completed: "Завершено",
    };

    toast.success(`Задача перемещена в "${statusLabels[newStatus]}"`);
  };

  const activeTask = activeId ? displayTasks.find((t: Task) => t.id === activeId) : null;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return displayTasks.filter((task: Task) => {
      const matchesSearch =
        (task.title?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
        (task.machine?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [displayTasks, searchQuery, priorityFilter]);

  const pendingTasks = filteredTasks.filter((t: Task) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t: Task) => t.status === "in-progress");
  const completedTasks = filteredTasks.filter((t: Task) => t.status === "completed");

  const handleCreateTask = () => {
    toast.success("Задача создана успешно!");
    setIsCreateDialogOpen(false);
    setNewTask({
      title: "",
      description: "",
      type: "Пополнение",
      priority: "medium",
      assignee: "",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Задачи</h1>
            <p className="text-gray-600 mt-1">Управление рабочими задачами и назначениями</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Создать задачу
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новую задачу</DialogTitle>
                <DialogDescription>
                  Заполните информацию о новой задаче
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название задачи</Label>
                  <Input
                    id="title"
                    placeholder="Введите название задачи"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    placeholder="Введите описание задачи"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Тип</Label>
                    <Select value={newTask.type} onValueChange={(value) => setNewTask({ ...newTask, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Пополнение">Пополнение</SelectItem>
                        <SelectItem value="Ремонт">Ремонт</SelectItem>
                        <SelectItem value="Обслуживание">Обслуживание</SelectItem>
                        <SelectItem value="Инспекция">Инспекция</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Приоритет</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="urgent">Срочный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Исполнитель</Label>
                  <Input
                    id="assignee"
                    placeholder="Введите имя исполнителя"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTask}>Создать задачу</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Всего задач</p>
                  <p className="text-2xl font-bold mt-1">{displayTasks.length}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Ожидание</p>
                  <p className="text-2xl font-bold mt-1 text-amber-700">{pendingTasks.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">В работе</p>
                  <p className="text-2xl font-bold mt-1 text-blue-700">{inProgressTasks.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Завершено</p>
                  <p className="text-2xl font-bold mt-1 text-green-700">{completedTasks.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по приоритету" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="urgent">Срочные</SelectItem>
                  <SelectItem value="high">Высокие</SelectItem>
                  <SelectItem value="medium">Средние</SelectItem>
                  <SelectItem value="low">Низкие</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Columns with Drag & Drop */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Загрузка задач...
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Column */}
              <TaskColumn
                id="pending"
                title="Ожидание"
                color="bg-amber-400"
                count={pendingTasks.length}
                tasks={pendingTasks}
              />

              {/* In Progress Column */}
              <TaskColumn
                id="in-progress"
                title="В работе"
                color="bg-blue-400"
                count={inProgressTasks.length}
                tasks={inProgressTasks}
              />

              {/* Completed Column */}
              <TaskColumn
                id="completed"
                title="Завершено"
                color="bg-emerald-400"
                count={completedTasks.length}
                tasks={completedTasks}
              />
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </Layout>
  );
}

interface TaskColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  tasks: Task[];
}

function TaskColumn({ id, title, color, count, tasks }: TaskColumnProps) {
  const { setNodeRef } = useSortable({
    id: id,
    data: {
      type: "column",
    },
  });

  return (
    <div ref={setNodeRef} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          {title}
        </h3>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {count}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function DraggableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Срочный";
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return priority;
    }
  };

  return (
    <Card
      className={`border hover:shadow-md transition-all duration-300 group cursor-grab active:cursor-grabbing ${
        isDragging ? "rotate-3 scale-105 shadow-lg" : ""
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Badge
              variant="outline"
              className={`
                ${task.priority === "urgent" ? "border-rose-500 text-rose-600 bg-rose-50" : ""}
                ${task.priority === "high" ? "border-orange-500 text-orange-600 bg-orange-50" : ""}
                ${task.priority === "medium" ? "border-blue-500 text-blue-600 bg-blue-50" : ""}
                ${task.priority === "low" ? "border-gray-500 text-gray-600 bg-gray-50" : ""}
              `}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
          <Badge variant="secondary" className="bg-gray-100">
            {task.type}
          </Badge>
        </div>

        <div>
          <h4 className="font-semibold">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
          )}
          {task.machine && (
            <p className="text-xs text-gray-500 mt-1">{task.machine}</p>
          )}
        </div>

        <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-600">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {task.assignee}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
