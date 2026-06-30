import './App.css'
// 1. Importe o layout que criamos (ajuste o caminho do arquivo conforme sua pasta)
import { DashboardLayout } from './pages/DashboardLayout'

function App() {
  return (
    // 2. Chame o Layout envelopando o seu conteúdo
    <DashboardLayout>

      {/* Todo o conteúdo que você colocar aqui dentro será renderizado no "miolo" da tela */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Olá, Mundo!</h1>
        <p className="text-slate-400">
          Bem-vindo ao espaço interno do **KomissX**. Este miolo está protegido e padronizado pelo Header e Footer corporativos.
        </p>
      </div>

    </DashboardLayout>
  )
}

export default App