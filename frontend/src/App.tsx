import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { DefaultLayout } from './components/layout/DefaultLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Se acessar a raiz "/", joga direto para a autenticação */}
        <Route path="/" element={<Navigate to="/autenticacao" replace />} />

        {/* Caso algum link antigo aponte para /login, redireciona para a rota certa */}
        <Route path="/login" element={<Navigate to="/autenticacao" replace />} />

        {/* A rota REAL da sua tela de login */}
        <Route path="/autenticacao" element={<Login />} />

        {/* Layout unificado com sub-rotas estruturadas */}
        <Route path="/admin" element={<DefaultLayout />}>
          {/* O index define qual componente aparece ao acessar exatamente "/admin" */}
          <Route index element={<Navigate to="motor-de-regras" replace />} />
          <Route path="motor-de-regras" element={<Admin />} />

          {/* Próximas páginas do sistema entram aqui: */}
          {/* <Route path="equipes" element={<Equipes />} /> */}
          {/* <Route path="metas" element={<Metas />} /> */}
        </Route>

        {/* Qualquer rota desconhecida joga o usuário para o painel admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}