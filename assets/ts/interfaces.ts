// Define os status e tipos possíveis como tipos literais
export type TipoManifestacao = 'anonimo' | 'identificado';
export type StatusManifestacao = 'Pendente' | 'Respondida' | 'Cancelada';

/**
 * Interface que representa uma Secretaria Municipal de São Pedro do Paraná
 */
export interface Secretaria {
    id: number;
    nome: string;
    ativa: boolean;
}

/**
 * Interface que representa um Tema/Categoria da reclamação
 */
export interface Tema {
    id: number;
    secretaria_id: number;
    nome: string;
}

/**
 * Mapeamento completo e estrito da Manifestação vinda da View (vw_manifestacoes_detalhadas) do PHP
 */
export interface Manifestacao {
    id: number;
    protocolo: string;
    tipo: TipoManifestacao;
    nome?: string;
    email?: string;
    telefone?: string;
    secretaria_id: number;
    secretaria_nome: string;
    tema_id: number;
    tema_nome: string;
    descricao: string;
    anexo_url?: string;
    status: StatusManifestacao;
    resposta?: string;
    data_resposta?: string;
    dias_atendimento: number;
    data_criacao: string;
}

/**
 * Estrutura para os filtros do Painel Administrativo
 */
export interface FiltrosDashboard {
    dataInicio?: string;
    dataFim?: string;
    secretariaId?: number;
    status?: StatusManifestacao;
}

/**
 * Estrutura das métricas calculadas na Dashboard
 */
export interface IndicadoresOuvidoria {
    total: number;
    pendentes: number;
    taxaResolucao: number;
    secretariaMaisDemandada: string;
}

/**
 * Padronização da resposta JSON emitida pela API PHP
 */
export interface ApiResponse<T = void> {
    sucesso: boolean;
    mensagem: string;
    dados?: T;
}