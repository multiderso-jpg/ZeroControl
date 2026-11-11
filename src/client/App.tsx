import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GuildaPage } from './pages/GuildaPage';
import { ForjaPage } from './pages/ForjaPage';
import { AliancaPage } from './pages/AliancaPage';
import { MissoesPage } from './pages/MissoesPage';
import { CompanhiaPage } from './pages/CompanhiaPage';
import { JornadaPage } from './pages/JornadaPage';
import { MutiraoPage } from './pages/MutiraoPage';
import { EmbaixadaPage } from './pages/EmbaixadaPage';
import { ComandoPage } from './pages/ComandoPage';
import { ConselhoPage } from './pages/ConselhoPage';
import { TesourariaPage } from './pages/TesourariaPage';
import { FundacaoPage } from './pages/FundacaoPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs font-mono">
        Inicializando Zero Control...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs font-mono">
        Carregando Zero Control...
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas de Acesso */}
      <Route
        path="/login"
        element={user ? <Navigate to="/guilda" replace /> : <LoginPage />}
      />
      <Route
        path="/cadastro"
        element={user ? <Navigate to="/guilda" replace /> : <RegisterPage />}
      />

      {/* Redirecionamento da raiz / */}
      <Route
        path="/"
        element={<Navigate to={user ? '/guilda' : '/login'} replace />}
      />

      {/* As 12 Páginas Principais dentro do Layout Responsivo */}
      <Route
        path="/guilda"
        element={
          <Layout>
            <GuildaPage />
          </Layout>
        }
      />
      <Route
        path="/guilda/publicacoes/:id"
        element={
          <Layout>
            <GuildaPage />
          </Layout>
        }
      />
      <Route
        path="/forja"
        element={
          <Layout>
            <ForjaPage />
          </Layout>
        }
      />
      <Route
        path="/alianca"
        element={
          <Layout>
            <AliancaPage />
          </Layout>
        }
      />
      <Route
        path="/missoes"
        element={
          <Layout>
            <MissoesPage />
          </Layout>
        }
      />
      <Route
        path="/companhia"
        element={
          <ProtectedRoute>
            <Layout>
              <CompanhiaPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jornada"
        element={
          <ProtectedRoute>
            <Layout>
              <JornadaPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mutirao"
        element={
          <Layout>
            <MutiraoPage />
          </Layout>
        }
      />
      <Route
        path="/embaixada"
        element={
          <ProtectedRoute>
            <Layout>
              <EmbaixadaPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/comando"
        element={
          <ProtectedRoute>
            <Layout>
              <ComandoPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conselho"
        element={
          <ProtectedRoute>
            <Layout>
              <ConselhoPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tesouraria"
        element={
          <ProtectedRoute>
            <Layout>
              <TesourariaPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fundacao"
        element={
          <Layout>
            <FundacaoPage />
          </Layout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/guilda" replace />} />
    </Routes>
  );
}
