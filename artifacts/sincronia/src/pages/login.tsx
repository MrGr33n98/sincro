import { useState } from "react";
import { Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { setAuthToken } from "@/hooks/use-auth";
import { ClayCard, ClayButton, ClayInput } from "@/components/ui/clay-components";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMut = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMut.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setAuthToken(data.token);
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
          <div className="mx-auto w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
            <Sparkles className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl text-foreground">Sincronia</h1>
          <p className="text-muted-foreground font-medium">O refúgio digital do seu relacionamento.</p>
        </div>

        <ClayCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground/80 pl-2">Email</label>
              <ClayInput 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="casal@amor.com"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-foreground/80 pl-2">Senha</label>
              <ClayInput 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>

            {loginMut.isError && (
              <p className="text-destructive text-sm text-center font-semibold">Email ou senha incorretos.</p>
            )}

            <ClayButton type="submit" className="w-full mt-2" isLoading={loginMut.isPending}>
              Entrar
            </ClayButton>
            
            <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
              Ainda não tem uma conta? <Link href="/register" className="text-primary font-bold hover:underline">Cadastre-se</Link>
            </p>
          </form>
        </ClayCard>
      </div>
    </div>
  );
}
