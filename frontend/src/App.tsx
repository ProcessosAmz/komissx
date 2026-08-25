import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { FORBIDDEN_ROUTE, LOGIN_ROUTE } from "@/const/auth";
import { DefaultLayout } from "@/layouts/DefaultLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Academy from "@/pages/Academy";
import Dashboard from "@/pages/Dashboard";
import Equipes from "@/pages/Equipes";
import Forbidden from "@/pages/forbidden/index.tsx";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found/index.tsx";
import PainelConfiguracoes from "@/pages/painel-configuracoes";
import HubFechamentos from "@/pages/Fechamentos";
import Autonomos from "@/pages/Fechamentos/semanal/autonomos";
import Retirada from "@/pages/Fechamentos/semanal/retirada";
import Tecnicos from "@/pages/Fechamentos/semanal/tecnicos";
import Cobranca from "@/pages/Fechamentos/mensal/cobranca";
import Comercial from "@/pages/Fechamentos/mensal/comercial";
import ComercialPJ from "@/pages/Fechamentos/mensal/comercial-pj";
import Producao from "@/pages/Fechamentos/mensal/producao";
import { GuestRoute } from "@/guards/guestRoute.tsx";
import { PermissionRoute } from "@/guards/permissionRoute.tsx";
import { PrivateRoute } from "@/guards/privateRoute.tsx";
import { RootRedirect } from "@/guards/rootRedirect.tsx";
import RelatorioSemanal from "@/pages/Fechamentos/relatorioSemana.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={LOGIN_ROUTE} replace />} />

        <Route element={<GuestRoute />}>
          <Route path={LOGIN_ROUTE} element={<Login />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<DefaultLayout />}>
            <Route index element={<RootRedirect />} />

            <Route element={<PermissionRoute modulo="producao" />}>
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<PermissionRoute modulo="academy" />}>
              <Route path="academy" element={<Academy />} />
            </Route>

            <Route element={<PermissionRoute modulo="fechamento" />}>
              <Route path="fechamentos">
                <Route index element={<HubFechamentos />} />
                <Route element={<AdminLayout />}>
                  <Route path="semanal">
                    <Route path="tecnicos" element={<Tecnicos />} />
                    <Route path="retirada" element={<Retirada />} />
                    <Route path="autonomos" element={<Autonomos />} />
                  </Route>
                  <Route path="mensal">
                    <Route path="comercial" element={<Comercial />} />
                    <Route path="producao" element={<Producao />} />
                    <Route path="comercial-pj" element={<ComercialPJ />} />
                    <Route path="cobranca" element={<Cobranca />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="configuracoes" element={<PainelConfiguracoes />}>
              <Route index element={<Equipes />} />
              <Route path="equipes" element={<Equipes />} />
              <Route path="semanal" element={<RelatorioSemanal />} />
            </Route>
          </Route>
        </Route>

        <Route path={FORBIDDEN_ROUTE} element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}