/**
 * Fórmulas de Gestão de Banca para Apostas Esportivas
 */

/**
 * Calcula o Stake (valor da aposta) usando o Criterion de Kelly
 * @param odd - Odd da aposta
 * @param probabilidade - Probabilidade percentual (0-100)
 * @param banca - Valor total da banca
 * @param kelly - Percentual do Kelly a usar (0.25 = Kelly Quarter, padrão)
 * @returns Valor do stake recomendado
 */
export function calcularStakeKelly(
  odd: number,
  probabilidade: number,
  banca: number,
  kelly: number = 0.25
): number {
  const probDecimal = probabilidade / 100;
  const valor = (odd * probDecimal - 1) / (odd - 1);
  const stakeKelly = valor * banca * kelly;
  
  // Stake mínimo de 1% e máximo de 10% da banca
  const stakeMinimo = banca * 0.01;
  const stakeMaximo = banca * 0.10;
  
  return Math.max(stakeMinimo, Math.min(stakeMaximo, stakeKelly));
}

/**
 * Calcula o ROI (Return on Investment) percentual
 * @param lucro - Lucro total
 * @param stakeTotal - Stake total investido
 * @returns ROI em percentual
 */
export function calcularROI(lucro: number, stakeTotal: number): number {
  if (stakeTotal === 0) return 0;
  return (lucro / stakeTotal) * 100;
}

/**
 * Calcula Yield (Taxa de Retorno) percentual
 * @param lucro - Lucro total
 * @param stakeTotal - Stake total investido
 * @returns Yield em percentual
 */
export function calcularYield(lucro: number, stakeTotal: number): number {
  return calcularROI(lucro, stakeTotal);
}

/**
 * Calcula o Valor Esperado (Expected Value)
 * @param odd - Odd da aposta
 * @param probabilidade - Probabilidade percentual (0-100)
 * @param stake - Valor do stake
 * @returns Valor esperado
 */
export function calcularValorEsperado(
  odd: number,
  probabilidade: number,
  stake: number
): number {
  const probDecimal = probabilidade / 100;
  const ganhoEsperado = odd * stake * probDecimal;
  const perdaEsperada = stake * (1 - probDecimal);
  return ganhoEsperado - perdaEsperada;
}

/**
 * Calcula Lucro Líquido após uma aposta
 * @param stake - Valor apostado
 * @param odd - Odd da aposta
 * @param resultado - "ganho" ou "perda"
 * @returns Lucro líquido (pode ser negativo)
 */
export function calcularLucro(
  stake: number,
  odd: number,
  resultado: 'ganho' | 'perda'
): number {
  if (resultado === 'ganho') {
    return stake * odd - stake;
  }
  return -stake;
}

/**
 * Calcula estatísticas de uma série de apostas
 */
export function calcularEstatisticas(apostas: Array<{
  stake: number;
  odd: number;
  status?: string | null;
  resultado?: string | null;
  lucro: number | null;
}>) {
  if (apostas.length === 0) {
    return {
      totalApostas: 0,
      apostasFinalizadas: 0,
      ganhos: 0,
      perdas: 0,
      reembolsos: 0,
      taxaAcerto: 0,
      stakeTotal: 0,
      lucroTotal: 0,
      roi: 0,
      oddMedia: 0,
      valorMedioStake: 0
    };
  }
  // Usa status se disponível, caso contrário usa resultado
  const apostasFinalizadas = apostas.filter(a => 
    (a.status && a.status !== 'pendente') || a.resultado !== null
  );
  
  const stakeTotal = apostas.reduce((sum, a) => sum + a.stake, 0);
  const lucroTotal = apostas
    .filter(a => a.lucro !== null)
    .reduce((sum, a) => sum + (a.lucro || 0), 0);
  
  const ganhos = apostasFinalizadas.filter(a => 
    a.status === 'green' || a.resultado === 'ganho'
  ).length;
  
  const perdas = apostasFinalizadas.filter(a => 
    a.status === 'red' || a.resultado === 'perda'
  ).length;
  
  const reembolsos = apostasFinalizadas.filter(a => 
    a.status === 'reembolso'
  ).length;
  
  const taxaAcerto = apostasFinalizadas.length > 0 
    ? (ganhos / apostasFinalizadas.length) * 100 
    : 0;
  
  const roi = calcularROI(lucroTotal, stakeTotal);
  const oddMedia = apostas.length > 0 
    ? apostas.reduce((sum, a) => sum + a.odd, 0) / apostas.length 
    : 0;
  
  return {
    totalApostas: apostas.length,
    apostasFinalizadas: apostasFinalizadas.length,
    ganhos,
    perdas,
    reembolsos,
    taxaAcerto: Number(taxaAcerto.toFixed(2)),
    stakeTotal: Number(stakeTotal.toFixed(2)),
    lucroTotal: Number(lucroTotal.toFixed(2)),
    roi: Number(roi.toFixed(2)),
    oddMedia: Number(oddMedia.toFixed(2)),
    valorMedioStake: Number((stakeTotal / apostas.length).toFixed(2))
  };
}

