import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BancaManager } from '../components/BancaManager';
import { ApostaListCard } from '../components/ApostaListCard';
import { apostaService } from '../services/apostaService';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [bancaId, setBancaId] = useState<string>('');
  const [reloadBanca, setReloadBanca] = useState(0);
  const [estatisticas, setEstatisticas] = useState({
    lucroMesAtual: 0,
    lucroMesAnterior: 0,
    roiMensal: 0,
    roi: 0,
    lucroTotal: 0
  });

  useEffect(() => {
    if (bancaId) {
      loadEstatisticas();
    }
  }, [bancaId, reloadBanca]);

  const loadEstatisticas = async () => {
    try {
      const data = await apostaService.getEstatisticas(bancaId);
      setEstatisticas({
        lucroMesAtual: data.lucroMesAtual || 0,
        lucroMesAnterior: data.lucroMesAnterior || 0,
        roiMensal: data.roiMensal || 0,
        roi: data.roi || 0,
        lucroTotal: data.lucroTotal || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bem-vindo, {user?.nome}! 👋
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Sair
              </button>
            </div>
          </div>

          {/* Banca Manager */}
          <BancaManager key={reloadBanca} onBancaLoaded={setBancaId} />

          {/* Aposta List Card */}
          {bancaId && (
            <div className="mt-8">
              <ApostaListCard bancaId={bancaId} onApostaChange={() => setReloadBanca(v => v + 1)} />
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Estatísticas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Lucro Mês Atual</h3>
                <p className={`text-3xl font-bold ${estatisticas.lucroMesAtual >= 0 ? 'text-white' : 'text-red-200'}`}>
                  R$ {estatisticas.lucroMesAtual.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Lucro Mês Anterior</h3>
                <p className={`text-3xl font-bold ${estatisticas.lucroMesAnterior >= 0 ? 'text-white' : 'text-red-200'}`}>
                  R$ {estatisticas.lucroMesAnterior.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">ROI Mensal</h3>
                <p className={`text-3xl font-bold ${estatisticas.roiMensal >= 0 ? 'text-white' : 'text-red-200'}`}>
                  {estatisticas.roiMensal.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">ROI Total</h3>
                <p className={`text-3xl font-bold ${estatisticas.roi >= 0 ? 'text-white' : 'text-red-200'}`}>
                  {estatisticas.roi.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Lucro Total</h3>
                <p className={`text-3xl font-bold ${estatisticas.lucroTotal >= 0 ? 'text-white' : 'text-red-200'}`}>
                  R$ {estatisticas.lucroTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

