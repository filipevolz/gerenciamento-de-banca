import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apostaService } from '../services/apostaService';
import { casaApostaService } from '../services/casaApostaService';
import { bancaService } from '../services/bancaService';
import type { Aposta, StatusAposta } from '../services/apostaService';
import type { CasaAposta } from '../services/casaApostaService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Pencil, Check, X, RotateCcw, Trash2, LogOut, Filter, XCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export function ApostasPage() {
  const { user, logout } = useAuth();
  const [banca, setBanca] = useState<any>(null);
  const [apostas, setApostas] = useState<Aposta[]>([]);
  const [casas, setCasas] = useState<CasaAposta[]>([]);
  const [mercadosSugeridos, setMercadosSugeridos] = useState<string[]>([]);
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
  const [showMercadosSugeridos, setShowMercadosSugeridos] = useState(false);
  
  // Filtros
  const [filtroDataInicial, setFiltroDataInicial] = useState<Date | undefined>(undefined);
  const [filtroDataFinal, setFiltroDataFinal] = useState<Date | undefined>(undefined);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroModalidade, setFiltroModalidade] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const bancas = await bancaService.getAll();
      if (bancas.length > 0) {
        const minhaBanca = bancas[0];
        setBanca(minhaBanca);
        const [apostasData, casasData, mercadosData] = await Promise.all([
          apostaService.getAll(minhaBanca.id),
          casaApostaService.getAll(minhaBanca.id),
          apostaService.getMercados(minhaBanca.id)
        ]);
        setApostas(apostasData);
        setCasas(casasData);
        setMercadosSugeridos(mercadosData);
      }
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAposta = async () => {
    if (casas.length === 0) {
      console.log('❌ Você precisa cadastrar uma casa de aposta antes de criar apostas!');
      return;
    }

    if (!novaAposta.modalidade || !novaAposta.mercado || !novaAposta.casaApostaId || !banca) {
      console.log('❌ Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apostaService.create({
        ...novaAposta,
        bancaId: banca.id
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
  };

  const handleUpdateAposta = async () => {
    if (!editandoAposta) return;
    if (!novaAposta.modalidade || !novaAposta.mercado || !novaAposta.casaApostaId || !banca) {
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
    } catch (error: any) {
      console.error('❌ Erro ao atualizar aposta:', error.response?.data?.error || error.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: StatusAposta) => {
    try {
      await apostaService.updateStatus(id, { status });
      console.log(`✅ Status atualizado para: ${status}`);
      loadData();
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

  // Filtrar apostas
  const apostasFiltradas = apostas.filter((aposta) => {
    const dataAposta = new Date(aposta.dataAposta);
    
    // Filtro por intervalo de data
    if (filtroDataInicial) {
      const dataInicial = new Date(filtroDataInicial);
      dataInicial.setHours(0, 0, 0, 0);
      if (dataAposta < dataInicial) return false;
    }

    if (filtroDataFinal) {
      const dataFinal = new Date(filtroDataFinal);
      dataFinal.setHours(23, 59, 59, 999);
      if (dataAposta > dataFinal) return false;
    }

    // Filtro por status
    if (filtroStatus && aposta.status !== filtroStatus) return false;

    // Filtro por modalidade
    if (filtroModalidade && aposta.modalidade !== filtroModalidade) return false;

    return true;
  });

  // Extrair modalidades únicas para o select
  const modalidadesUnicas = Array.from(new Set(apostas.map(a => a.modalidade))).sort();

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroDataInicial(undefined);
    setFiltroDataFinal(undefined);
    setFiltroStatus('');
    setFiltroModalidade('');
  };

  // Verificar se há filtros ativos
  const temFiltrosAtivos = filtroDataInicial || filtroDataFinal || filtroStatus || filtroModalidade;

  if (isLoading) {
    return <div className="text-center py-8">Carregando apostas...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Minhas Apostas
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <div className="flex gap-3">
                  <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Voltar ao Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
              </div>
            </div>
          </div>

          {/* Aposta Manager */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Todas as Apostas</h2>
              <button
                onClick={() => setIsAddingAposta(!isAddingAposta)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {isAddingAposta ? 'Cancelar' : '+ Nova Aposta'}
              </button>
            </div>

            {/* Filtros */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                {temFiltrosAtivos && (
                  <button
                    onClick={limparFiltros}
                    className="ml-auto flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Limpar Filtros
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtroDataInicial ? (
                          format(filtroDataInicial, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span className="text-gray-500">Selecione...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtroDataInicial}
                        onSelect={setFiltroDataInicial}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtroDataFinal ? (
                          format(filtroDataFinal, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span className="text-gray-500">Selecione...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtroDataFinal}
                        onSelect={setFiltroDataFinal}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select 
                    value={filtroStatus || undefined} 
                    onValueChange={(value) => setFiltroStatus(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="reembolso">Reembolso</SelectItem>
                    </SelectContent>
                  </Select>
                  {filtroStatus && (
                    <button
                      onClick={() => setFiltroStatus('')}
                      className="mt-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidade
                  </label>
                  <Select 
                    value={filtroModalidade || undefined} 
                    onValueChange={(value) => setFiltroModalidade(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalidadesUnicas.map((modalidade) => (
                        <SelectItem key={modalidade} value={modalidade}>
                          {modalidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filtroModalidade && (
                    <button
                      onClick={() => setFiltroModalidade('')}
                      className="mt-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              {temFiltrosAtivos && (
                <div className="mt-3 text-sm text-gray-600">
                  Mostrando {apostasFiltradas.length} de {apostas.length} apostas
                </div>
              )}
            </div>

            {isAddingAposta && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="font-semibold text-gray-900 mb-4">Nova Aposta</h3>
                
                {casas.length === 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-semibold">
                      ⚠️ Você precisa cadastrar uma casa de aposta antes de criar apostas!
                    </p>
                    <p className="text-red-600 text-xs mt-1">
                      Vá até a seção "Casas de Aposta" no dashboard e clique em "+ Adicionar Casa"
                    </p>
                  </div>
                )}
                
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

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mercado *
                    </label>
                    <input
                      type="text"
                      value={novaAposta.mercado}
                      onChange={(e) => {
                        setNovaAposta({ ...novaAposta, mercado: e.target.value });
                        setShowMercadosSugeridos(true);
                      }}
                      onFocus={() => setShowMercadosSugeridos(true)}
                      onBlur={() => setTimeout(() => setShowMercadosSugeridos(false), 200)}
                      placeholder="Ex: Finalizações, Resultado..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    {showMercadosSugeridos && mercadosSugeridos.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {mercadosSugeridos
                          .filter(m => m.toLowerCase().includes(novaAposta.mercado.toLowerCase()))
                          .map((mercado, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNovaAposta({ ...novaAposta, mercado });
                                setShowMercadosSugeridos(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition"
                            >
                              {mercado}
                            </button>
                          ))}
                      </div>
                    )}
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
                    onClick={handleAddAposta}
                    disabled={casas.length === 0}
                    className={`px-6 py-2 rounded-lg transition ${
                      casas.length === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Salvar Aposta
                  </button>
                </div>
              </div>
            )}

            {apostas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">Nenhuma aposta cadastrada</p>
                <p className="text-sm">Clique em "Nova Aposta" para começar</p>
              </div>
            ) : apostasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">Nenhuma aposta encontrada com os filtros aplicados</p>
                <button
                  onClick={limparFiltros}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {apostasFiltradas.map((aposta) => (
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
                          className="p-2 text-gray-700 hover:bg-gray-100 rounded transition"
                          title="Editar"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        {aposta.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(aposta.id, 'green')}
                              className="p-2 text-gray-700 hover:bg-green-50 rounded transition"
                              title="Marcar como Green"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(aposta.id, 'red')}
                              className="p-2 text-gray-700 hover:bg-red-50 rounded transition"
                              title="Marcar como Red"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(aposta.id, 'reembolso')}
                              className="p-2 text-gray-700 hover:bg-yellow-50 rounded transition"
                              title="Marcar como Reembolso"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteAposta(aposta.id)}
                          className="p-2 text-gray-700 hover:bg-red-50 rounded transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editandoAposta} onOpenChange={() => setEditandoAposta(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aposta</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Casa de Aposta *
              </label>
              <select
                value={novaAposta.casaApostaId}
                onChange={(e) => setNovaAposta({ ...novaAposta, casaApostaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                step="0.01"
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
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={novaAposta.descricao}
              onChange={(e) => setNovaAposta({ ...novaAposta, descricao: e.target.value })}
              placeholder="Descrição da aposta..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleUpdateAposta}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Atualizar Aposta
            </button>
            <button
              onClick={() => setEditandoAposta(null)}
              className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

