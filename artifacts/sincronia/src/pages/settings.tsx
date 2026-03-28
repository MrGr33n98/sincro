import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, LogOut, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/atoms/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

type Tab = "profile" | "notifications" | "account" | "subscription";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Perfil", icon: <User className="w-4 h-4" /> },
  { id: "notifications", label: "Notificações", icon: <Bell className="w-4 h-4" /> },
  { id: "account", label: "Conta", icon: <Shield className="w-4 h-4" /> },
  { id: "subscription", label: "Assinatura", icon: <CreditCard className="w-4 h-4" /> },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            toast.success("Logout realizado com sucesso!");
          }}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="gap-2 shrink-0 rounded-full"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && <ProfileTab user={user} />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "account" && <AccountTab />}
      {activeTab === "subscription" && <SubscriptionTab />}
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>Atualize sua foto de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || "User"} src={user?.avatarUrl} size="xl" />
            <Button variant="outline" className="gap-2">
              <Camera className="w-4 h-4" />
              Alterar foto
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" defaultValue={user?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email} />
          </div>
          <Button className="w-full">Salvar alterações</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NotificationsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Notificações Push</CardTitle>
          <CardDescription>Escolha quais notificações você quer receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mood do parceiro</p>
              <p className="text-sm text-muted-foreground">Receba quando seu parceiro registrar o humor</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lembrete diário</p>
              <p className="text-sm text-muted-foreground">Lembrete para registrar seu humor</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nudges de carinho</p>
              <p className="text-sm text-muted-foreground">Sugestões para demonstrar carinho</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Novos dates sugeridos</p>
              <p className="text-sm text-muted-foreground">Quando a IA tiver novas sugestões</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AccountTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" />
          </div>
          <Button className="w-full">Alterar senha</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" className="w-full">
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubscriptionTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <CardTitle>Plano Pro</CardTitle>
          </div>
          <CardDescription className="text-pink-100">
            Aproveite todos os recursos premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                Sugestões de date ilimitadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                Mediação de conflitos por IA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                AI Concierge chat ilimitado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-300">✓</span>
                Timeline emocional avançada
              </li>
            </ul>
            <Button variant="secondary" className="w-full">
              Gerenciar assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
