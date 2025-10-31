import { useState, useEffect } from 'react';
import { casaApostaService } from '../services/casaApostaService';
import { bancaService } from '../services/bancaService';
import { apostaService } from '../services/apostaService';
import type { CasaAposta } from '../services/casaApostaService';
import type { Banca } from '../services/bancaService';
import type { Aposta } from '../services/apostaService';

interface BancaManagerProps {
  onBancaLoaded?: (bancaId: string) => void;
}

export function BancaManager({ onBancaLoaded }: BancaManagerProps) {
  const [banca, setBanca] = useState<Banca | null>(null);
  const [casas, setCasas] = useState<CasaAposta[]>([]);
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCasa, setIsAddingCasa] = useState(false);
  const [editandoCasa, setEditandoCasa] = useState<string | null>(null);
  const [novaCasa, setNovaCasa] = useState({ nome: '', saldoAtual: 0, valorUnidade: 0 });

  useEffect(() => {
    loadBancaAndCasas();
  }, []);

  const loadBancaAndCasas = async () => {
    try {
      setIsLoading(true);
      // Buscar bancas do usuário
      const bancas = await bancaService.getAll();
      let minhaBanca: Banca;
      
      if (bancas.length > 0) {
        minhaBanca = bancas[0];
      } else {
        // Criar banca automaticamente se não existir
        minhaBanca = await bancaService.create({
          nome: 'Minha Banca',
          saldoInicial: 0
        });
      }
      
      setBanca(minhaBanca);
      const [data, apostasData] = await Promise.all([
        casaApostaService.getAll(minhaBanca.id),
        apostaService.getAll(minhaBanca.id)
      ]);
      setCasas(data);
      setApostas(apostasData);
      onBancaLoaded?.(minhaBanca.id);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCasa = async () => {
    if (!novaCasa.nome.trim()) {
      console.log('❌ Digite o nome da banca');
      return;
    }

    if (!banca) {
      console.log('❌ Primeiro crie uma banca');
      return;
    }

    try {
      await casaApostaService.create({
        bancaId: banca.id,
        nome: novaCasa.nome,
        saldoAtual: novaCasa.saldoAtual,
        valorUnidade: novaCasa.valorUnidade
      });
      console.log('✅ Banca adicionada com sucesso!');
      setNovaCasa({ nome: '', saldoAtual: 0, valorUnidade: 0 });
      setIsAddingCasa(false);
      loadBancaAndCasas();
    } catch (error: any) {
      console.error('❌ Erro ao adicionar banca:', error.response?.data?.error || error.message);
    }
  };

  const handleEditCasa = (casa: CasaAposta) => {
    setEditandoCasa(casa.id);
    setNovaCasa({ nome: casa.nome, saldoAtual: casa.saldoAtual, valorUnidade: casa.valorUnidade });
    setIsAddingCasa(false);
  };

  const handleUpdateCasa = async () => {
    if (!novaCasa.nome.trim()) {
      console.log('❌ Digite o nome da banca');
      return;
    }

    if (!editandoCasa) return;

    try {
      await casaApostaService.update(editandoCasa, {
        nome: novaCasa.nome,
        saldoAtual: novaCasa.saldoAtual,
        valorUnidade: novaCasa.valorUnidade
      });
      console.log('✅ Banca atualizada com sucesso!');
      setNovaCasa({ nome: '', saldoAtual: 0, valorUnidade: 0 });
      setEditandoCasa(null);
      loadBancaAndCasas();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar banca:', error.response?.data?.error || error.message);
    }
  };

  const handleDeleteCasa = async (id: string, nome: string) => {
    if (!window.confirm(`Deseja realmente excluir a banca "${nome}"?`)) {
      return;
    }

    try {
      await casaApostaService.delete(id);
      console.log('✅ Banca deletada com sucesso!');
      loadBancaAndCasas();
    } catch (error: any) {
      console.error('❌ Erro ao deletar banca:', error.response?.data?.error || error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditandoCasa(null);
    setNovaCasa({ nome: '', saldoAtual: 0, valorUnidade: 0 });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  // Se não tem banca ainda, mostrar loading (está sendo criada)
  if (!banca) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const saldoTotal = casas.reduce((sum, casa) => sum + casa.saldoAtual, 0);

  // Calcular pendentes por casa
  const getPendentesPorCasa = (casaId: string) => {
    const apostasPendentes = apostas.filter(
      aposta => aposta.casaApostaId === casaId && aposta.status === 'pendente'
    );
    const unidadesPendentes = apostasPendentes.reduce((sum, aposta) => sum + aposta.unidades, 0);
    const valorPendente = apostasPendentes.reduce((sum, aposta) => sum + aposta.stake, 0);
    return { unidadesPendentes, valorPendente };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Banca</h2>
        <button
          onClick={() => setIsAddingCasa(!isAddingCasa)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {isAddingCasa ? 'Cancelar' : '+ Adicionar Banca'}
        </button>
      </div>

      {(isAddingCasa || editandoCasa) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editandoCasa ? 'Editar Banca' : 'Nova Banca'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Casa de aposta
              </label>
              <input
                type="text"
                value={novaCasa.nome}
                onChange={(e) => setNovaCasa({ ...novaCasa, nome: e.target.value })}
                placeholder="Ex: Bet365, Betfair..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Atual (R$)
              </label>
              <input
                type="number"
                value={novaCasa.saldoAtual || ''}
                onChange={(e) => setNovaCasa({ ...novaCasa, saldoAtual: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Unidade (R$)
              </label>
              <input
                type="number"
                value={novaCasa.valorUnidade || ''}
                onChange={(e) => setNovaCasa({ ...novaCasa, valorUnidade: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 50"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editandoCasa ? handleUpdateCasa : handleAddCasa}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {editandoCasa ? 'Atualizar' : 'Salvar'} Banca
            </button>
            <button
              onClick={() => {
                editandoCasa ? handleCancelEdit() : setIsAddingCasa(false);
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Saldo Total */}
      <div className="mb-6 p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-100">Banca Total</p>
            <p className="text-3xl font-bold">R$ {saldoTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">{casas.length} Banca(s)</p>
          </div>
        </div>
      </div>

      {/* Lista de Bancas */}
      {casas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nenhuma banca cadastrada</p>
          <p className="text-sm">Clique em "Adicionar Banca" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {casas.map((casa) => {
            const { unidadesPendentes, valorPendente } = getPendentesPorCasa(casa.id);
            return (
              <div key={casa.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{casa.nome}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditCasa(casa)}
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCasa(casa.id, casa.nome)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                      title="Excluir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {casa.saldoAtual.toFixed(2)}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    {((casa.saldoAtual / saldoTotal) * 100).toFixed(1)}% da banca
                  </p>
                  {casa.valorUnidade > 0 && (
                    <p className="text-xs font-semibold text-indigo-600">
                      1 Unidade = R$ {casa.valorUnidade.toFixed(2)}
                    </p>
                  )}
                  {unidadesPendentes > 0 && (
                    <>
                      <p className="text-xs font-semibold text-orange-600 mt-2">
                        Pendente: {unidadesPendentes.toFixed(2)}u
                      </p>
                      <p className="text-xs font-semibold text-orange-600">
                        Valor: R$ {valorPendente.toFixed(2)}
                      </p>
                    </>
                  )}
                  <p className="text-xs font-semibold text-blue-600 mt-2">
                    Saldo Disponível: R$ {(casa.saldoAtual - valorPendente).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
