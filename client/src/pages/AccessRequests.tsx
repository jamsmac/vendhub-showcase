import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, User, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AccessRequests() {
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { data: allRequests, refetch } = trpc.accessRequests.list.useQuery();
  const { data: pendingRequests } = trpc.accessRequests.pending.useQuery();

  const approveMutation = trpc.accessRequests.approve.useMutation({
    onSuccess: () => {
      toast.success("Заявка одобрена", {
        description: "Пользователь получил уведомление в Telegram",
      });
      refetch();
      setSelectedRequest(null);
      setAction(null);
    },
    onError: (error) => {
      toast.error("Ошибка при одобрении", {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.accessRequests.reject.useMutation({
    onSuccess: () => {
      toast.success("Заявка отклонена", {
        description: "Пользователь получил уведомление в Telegram",
      });
      refetch();
      setSelectedRequest(null);
      setAction(null);
    },
    onError: (error) => {
      toast.error("Ошибка при отклонении", {
        description: error.message,
      });
    },
  });

  const handleApprove = (id: number) => {
    setSelectedRequest(id);
    setAction("approve");
  };

  const handleReject = (id: number) => {
    setSelectedRequest(id);
    setAction("reject");
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    // TODO: Get actual user ID from auth context
    const approvedBy = 1;

    if (action === "approve") {
      approveMutation.mutate({ id: selectedRequest, approvedBy });
    } else if (action === "reject") {
      rejectMutation.mutate({ id: selectedRequest, approvedBy });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            На рассмотрении
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            Одобрена
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <X className="w-3 h-3 mr-1" />
            Отклонена
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "operator":
        return <Badge variant="secondary">Оператор</Badge>;
      case "manager":
        return <Badge variant="default">Менеджер</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="container max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Заявки на доступ</h1>
          <p className="text-slate-400">Управление запросами на доступ через Telegram бот</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Всего заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{allRequests?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-400">На рассмотрении</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-300">{pendingRequests?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-400">Одобрено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300">
                {allRequests?.filter((r) => r.status === "approved").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Список заявок</CardTitle>
            <CardDescription className="text-slate-400">
              Просмотр и управление заявками на доступ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
                <TabsTrigger value="pending">На рассмотрении</TabsTrigger>
                <TabsTrigger value="approved">Одобренные</TabsTrigger>
                <TabsTrigger value="all">Все</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {!pendingRequests || pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет заявок на рассмотрении</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Пользователь</TableHead>
                        <TableHead className="text-slate-400">Telegram ID</TableHead>
                        <TableHead className="text-slate-400">Роль</TableHead>
                        <TableHead className="text-slate-400">Дата подачи</TableHead>
                        <TableHead className="text-slate-400">Статус</TableHead>
                        <TableHead className="text-slate-400 text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id} className="border-slate-800">
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="font-medium">
                                  {request.firstName || request.username || "Неизвестно"}
                                </div>
                                {request.username && (
                                  <div className="text-xs text-slate-400">@{request.username}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300 font-mono text-sm">
                            {request.telegramId}
                          </TableCell>
                          <TableCell>{getRoleBadge(request.requestedRole)}</TableCell>
                          <TableCell className="text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(request.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                onClick={() => handleApprove(request.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Одобрить
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleReject(request.id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Отклонить
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                {!allRequests || allRequests.filter((r) => r.status === "approved").length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет одобренных заявок</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Пользователь</TableHead>
                        <TableHead className="text-slate-400">Telegram ID</TableHead>
                        <TableHead className="text-slate-400">Роль</TableHead>
                        <TableHead className="text-slate-400">Дата подачи</TableHead>
                        <TableHead className="text-slate-400">Дата одобрения</TableHead>
                        <TableHead className="text-slate-400">Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRequests
                        .filter((r) => r.status === "approved")
                        .map((request) => (
                          <TableRow key={request.id} className="border-slate-800">
                            <TableCell className="text-white">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <div>
                                  <div className="font-medium">
                                    {request.firstName || request.username || "Неизвестно"}
                                  </div>
                                  {request.username && (
                                    <div className="text-xs text-slate-400">@{request.username}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono text-sm">
                              {request.telegramId}
                            </TableCell>
                            <TableCell>{getRoleBadge(request.requestedRole)}</TableCell>
                            <TableCell className="text-slate-400">{formatDate(request.createdAt)}</TableCell>
                            <TableCell className="text-slate-400">
                              {request.approvedAt ? formatDate(request.approvedAt) : "—"}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                {!allRequests || allRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет заявок</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Пользователь</TableHead>
                        <TableHead className="text-slate-400">Telegram ID</TableHead>
                        <TableHead className="text-slate-400">Роль</TableHead>
                        <TableHead className="text-slate-400">Дата подачи</TableHead>
                        <TableHead className="text-slate-400">Статус</TableHead>
                        <TableHead className="text-slate-400 text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRequests.map((request) => (
                        <TableRow key={request.id} className="border-slate-800">
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="font-medium">
                                  {request.firstName || request.username || "Неизвестно"}
                                </div>
                                {request.username && (
                                  <div className="text-xs text-slate-400">@{request.username}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300 font-mono text-sm">
                            {request.telegramId}
                          </TableCell>
                          <TableCell>{getRoleBadge(request.requestedRole)}</TableCell>
                          <TableCell className="text-slate-400">{formatDate(request.createdAt)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            {request.status === "pending" && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                  onClick={() => handleApprove(request.id)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Одобрить
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                  onClick={() => handleReject(request.id)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={action !== null} onOpenChange={() => setAction(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {action === "approve" ? "Одобрить заявку?" : "Отклонить заявку?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {action === "approve"
                ? "Пользователь получит уведомление в Telegram и сможет войти в систему."
                : "Пользователь получит уведомление об отклонении заявки."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {action === "approve" ? "Одобрить" : "Отклонить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
