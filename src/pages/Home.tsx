import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
export const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Bem-vindo</CardTitle>
          <CardDescription>Você está autenticado como {user?.email}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Área inicial protegida do sistema.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Link to="/tasks">
            <Button className="w-full">Ir para tarefas</Button>
          </Link>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleLogout}>
            Sair
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
export default Home;