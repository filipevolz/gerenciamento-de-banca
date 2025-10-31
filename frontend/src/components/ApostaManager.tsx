import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apostaService } from '../services/apostaService';
import { casaApostaService } from '../services/casaApostaService';
import type { Aposta, StatusAposta } from '../services/apostaService';
import type { CasaAposta } from '../services/casaApostaService';

interface Props {
  bancaId: string;
  onApostaChange?: () => void;
}

export function ApostaManager({ bancaId, onApostaChange }: Props) {
  const { user } = useAuth();
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [casas, setCasas] = useState<CasaAposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAposta, setIsAddingAposta] = useState(false);
  const [editandoAposta, setEditandoAposta] = useState<string | null>(null);
  const [novaAposta, setNovaAposta] = useState({
    casaApostaId: '',
    dataAposta: new Date().toISOString().split('T')[0],
    modalidade: '',
    mercado: '',
    descricao: '',
    odd: 0,
    unidades: 0,
    status: 'pendente' as StatusAposta
  });

  useEffect(() => {
    loadData();
  }, [bancaId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [apostasData, casasData] = await Promise.all([
        apostaService.getAll(bancaId),
        casaApostaService.getAll(bancaId)
      ]);
      setApostas(apostasData);
      setCasas(casasData);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAposta = async () => {
    if (!novaAposta.modalidade || !novaAposta.mercado || !novaAposta.casaApostaId) {
      console.log('❌ Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apostaService.create({
        ...novaAposta,
        bancaId
      });
      console.log('✅ Aposta criada com sucesso!');
      setNovaAposta({
        casaApostaId: '',
        dataAposta: new Date().toISOString().split('T')[0],
        modalidade: '',
        mercado: '',
        descricao: '',
        odd: 0,
        unidades: 0,
        status: 'pendente'
      });
      setIsAddingAposta(false);
      loadData();
      onApostaChange?.(); // Recarregar banca se status não for pendente
    } catch (error: any) {
      console.error('❌ Erro ao criar aposta:', error.response?.data?.error || error.message);
    }
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEditAposta = (aposta: Aposta) => {
    setEditandoAposta(aposta.id);
    setNovaAposta({
      casaApostaId: aposta.casaApostaId || '',
      dataAposta: formatDateForInput(aposta.dataAposta),
      modalidade: aposta.modalidade,
      mercado: aposta.mercado,
      descricao: aposta.descricao || '',
      odd: aposta.odd,
      unidades: aposta.unidades,
      status: aposta.status
    });
    setIsAddingAposta(false);
  };

  const handleUpdateAposta = async () => {
    if (!editandoAposta) return;
    if (!novaAposta.modalidade || !novaAposta.mercado || !novaAposta.casaApostaId) {
      console.log('❌ Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apostaService.update(editandoAposta, novaAposta);
      console.log('✅ Aposta atualizada com sucesso!');
      setNovaAposta({
        casaApostaId: '',
        dataAposta: new Date().toISOString().split('T')[0],
        modalidade: '',
        mercado: '',
        descricao: '',
        odd: 0,
        unidades: 0,
        status: 'pendente'
      });
      setEditandoAposta(null);
      loadData();
      onApostaChange?.();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar aposta:', error.response?.data?.error || error.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: StatusAposta) => {
    try {
      await apostaService.updateStatus(id, { status });
      console.log(`✅ Status atualizado para: ${status}`);
      loadData();
      onApostaChange?.(); // Recarregar banca
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status:', error.response?.data?.error || error.message);
    }
  };

  const handleDeleteAposta = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta aposta?')) return;

    try {
      await apostaService.delete(id);
      console.log('✅ Aposta deletada com sucesso!');
      loadData();
    } catch (error: any) {
      console.error('❌ Erro ao deletar aposta:', error.response?.data?.error || error.message);
    }
  };

  const getStatusColor = (status: StatusAposta) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'reembolso': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando apostas...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Apostas</h2>
        <button
          onClick={() => setIsAddingAposta(!isAddingAposta)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {isAddingAposta ? 'Cancelar' : '+ Nova Aposta'}
        </button>
      </div>

      {(isAddingAposta || editandoAposta) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4">{editandoAposta ? 'Editar Aposta' : 'Nova Aposta'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Casa de Aposta *
              </label>
              <select
                value={novaAposta.casaApostaId}
                onChange={(e) => setNovaAposta({ ...novaAposta, casaApostaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {casas.map(casa => (
                  <option key={casa.id} value={casa.id}>{casa.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={novaAposta.dataAposta}
                onChange={(e) => setNovaAposta({ ...novaAposta, dataAposta: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidade *
              </label>
              <select
                value={novaAposta.modalidade}
                onChange={(e) => setNovaAposta({ ...novaAposta, modalidade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="Futebol">Futebol</option>
                <option value="NBA">NBA</option>
                <option value="NFL">NFL</option>
                <option value="Tennis">Tennis</option>
                <option value="Boxe">Boxe</option>
                <option value="MMA">MMA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mercado *
              </label>
              <input
                type="text"
                value={novaAposta.mercado}
                onChange={(e) => setNovaAposta({ ...novaAposta, mercado: e.target.value })}
                placeholder="Ex: Finalizações, Resultado..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odd *
              </label>
              <input
                type="number"
                value={novaAposta.odd || ''}
                onChange={(e) => setNovaAposta({ ...novaAposta, odd: parseFloat(e.target.value) || 0 })}
                step="0.01"
                placeholder="Ex: 2.50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidades *
              </label>
              <input
                type="number"
                value={novaAposta.unidades || ''}
                onChange={(e) => setNovaAposta({ ...novaAposta, unidades: parseFloat(e.target.value) || 0 })}
                step="0.5"
                placeholder="Ex: 1, 1.5, 2..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={novaAposta.status}
                onChange={(e) => setNovaAposta({ ...novaAposta, status: e.target.value as StatusAposta })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pendente">Pendente</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                <option value="reembolso">Reembolso</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={novaAposta.descricao}
                onChange={(e) => setNovaAposta({ ...novaAposta, descricao: e.target.value })}
                placeholder="Descrição da aposta..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editandoAposta ? handleUpdateAposta : handleAddAposta}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {editandoAposta ? 'Atualizar' : 'Salvar'} Aposta
            </button>
            {editandoAposta && (
              <button
                onClick={() => {
                  setEditandoAposta(null);
                  setNovaAposta({
                    casaApostaId: '',
                    dataAposta: new Date().toISOString().split('T')[0],
                    modalidade: '',
                    mercado: '',
                    descricao: '',
                    odd: 0,
                    unidades: 0,
                    status: 'pendente'
                  });
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {apostas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nenhuma aposta cadastrada</p>
          <p className="text-sm">Clique em "Nova Aposta" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apostas.map((aposta) => (
            <div key={aposta.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(aposta.status)}`}>
                      {aposta.status.toUpperCase()}
                    </span>
                    <span className="font-semibold text-gray-900">{aposta.modalidade}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{aposta.mercado}</span>
                    {aposta.descricao && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 italic">{aposta.descricao}</span>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Data:</span>
                      <span className="ml-1 font-medium">{new Date(aposta.dataAposta).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Casa:</span>
                      <span className="ml-1 font-medium">{aposta.casaApostaNome || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Odd:</span>
                      <span className="ml-1 font-bold text-indigo-600">{aposta.odd}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Unidades:</span>
                      <span className="ml-1 font-medium">{aposta.unidades}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stake:</span>
                      <span className="ml-1 font-bold text-green-600">R$ {aposta.stake.toFixed(2)}</span>
                    </div>
                  </div>
                  {aposta.lucro !== null && aposta.lucro !== undefined && aposta.status !== 'pendente' && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Lucro:</span>
                      <span className={`ml-1 font-bold ${aposta.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {aposta.lucro.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => handleEditAposta(aposta)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  {aposta.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(aposta.id, 'green')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                        title="Marcar como Green"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(aposta.id, 'red')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Marcar como Red"
                      >
                        ✗
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(aposta.id, 'reembolso')}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition"
                        title="Marcar como Reembolso"
                      >
                        ↻
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteAposta(aposta.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Excluir"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

