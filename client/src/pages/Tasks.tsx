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
import { useDictionaryOptions } from "@/hooks/useDictionaries";

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
    type: "refill",
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
    type: "repair",
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
    type: "cleaning",
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
    type: "refill",
    priority: "medium",
    status: "pending",
    assignee: "Анна Петрова",
    dueDate: "Завтра, 10:00",
  },
];

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{task.title}</h3>
            {task.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {task.type}
          </Badge>
        </div>

        {task.machine && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {task.machine}
          </div>
        )}

        {task.assignee && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee}
          </div>
        )}

        {task.dueDate && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Tasks() {
  const [displayTasks, setDisplayTasks] = useState<Task[]>(mockTasks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "refill",
    priority: "medium",
    assignee: "",
  });
  const [activeId, setActiveId] = useState<number | null>(null);

  // Get dictionary options
  const taskTypeOptions = useDictionaryOptions('task_types');
  const taskPriorityOptions = useDictionaryOptions('task_priorities');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
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

    if (over && active.id !== over.id) {
      setDisplayTasks((tasks) => {
        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);

        const newTasks = [...tasks];
        const [movedTask] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, movedTask);

        return newTasks;
      });
    }

    setActiveId(null);
  };

  const filteredTasks = displayTasks.filter((task: Task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.machine?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const pendingTasks = filteredTasks.filter((t: Task) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t: Task) => t.status === "in-progress");
  const completedTasks = filteredTasks.filter((t: Task) => t.status === "completed");

  // Use tRPC mutations
  const createTaskMutation = trpc.tasks.create.useMutation();
  const updateTaskMutation = trpc.tasks.update.useMutation();

  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error("Please enter task title");
      return;
    }
    try {
      await createTaskMutation.mutateAsync({
        title: newTask.title,
        description: newTask.description || undefined,
        type: newTask.type,
        priority: newTask.priority,
        status: "pending",
      });
      toast.success("Задача создана успешно!");
      setIsCreateDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        type: "refill",
        priority: "medium",
        assignee: "",
      });
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: newStatus,
      });
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
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
                  <Label htmlFor="title">Название задачи *</Label>
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
                    <Label htmlFor="type">Тип задачи *</Label>
                    <Select value={newTask.type} onValueChange={(value) => setNewTask({ ...newTask, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon && <span className="mr-2">{option.icon}</span>}
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Приоритет *</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskPriorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon && <span className="mr-2">{option.icon}</span>}
                            {option.label}
                          </SelectItem>
                        ))}
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
                  <p className="text-sm text-green-700">Выполнено</p>
                  <p className="text-2xl font-bold mt-1 text-green-700">{completedTasks.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все приоритеты</SelectItem>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="urgent">Срочный</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-lg">Ожидание ({pendingTasks.length})</h2>
              </div>
              <SortableContext
                items={pendingTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>

            {/* In Progress Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-lg">В работе ({inProgressTasks.length})</h2>
              </div>
              <SortableContext
                items={inProgressTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {inProgressTasks.map((task) => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>

            {/* Completed Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h2 className="font-semibold text-lg">Выполнено ({completedTasks.length})</h2>
              </div>
              <SortableContext
                items={completedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <SortableTaskCard task={displayTasks.find((t) => t.id === activeId)!} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </Layout>
  );
}
export default Tasks;
