import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { setAuthToken } from "@/hooks/use-auth";
import { ClayCard, ClayButton, ClayInput } from "@/components/ui/clay-components";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const registerMut = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMut.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (data) => {
          setAuthToken(data.token);
          setTimeout(() => setLocation("/invite"), 100);
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 z-0 opacity-40">
        <img src={`${import.meta.env.BASE_URL}images/auth-bg.png`} alt="background" className="w-full h-full object-cover" />
      </div>
      
      <div className="z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl text-foreground">Criar Conta</h1>
          <p className="text-muted-foreground font-medium">Comece a fortalecer sua conexão hoje.</p>
        </div>

        <ClayCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground/80 pl-2">Seu Nome</label>
              <ClayInput required value={name} onChange={e => setName(e.target.value)} placeholder="João..." />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground/80 pl-2">Email</label>
              <ClayInput type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@email.com" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground/80 pl-2">Senha</label>
              <ClayInput type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>

            {registerMut.isError && (
              <p className="text-destructive text-sm text-center font-semibold">Ocorreu um erro ao registrar.</p>
            )}

            <ClayButton type="submit" className="w-full mt-2" isLoading={registerMut.isPending}>
              Continuar
            </ClayButton>
            
            <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
              Já tem uma conta? <Link href="/login" className="text-primary font-bold hover:underline">Entrar</Link>
            </p>
          </form>
        </ClayCard>
      </div>
    </div>
  );
}
