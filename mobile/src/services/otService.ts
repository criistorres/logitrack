// mobile/src/services/otService.ts

import { apiService } from './api';

// ==============================================================================
// 📋 TIPOS E INTERFACES PARA OTs
// ==============================================================================

export interface CriarOTRequest {
  cliente_nome?: string;
  endereco_entrega: string;
  cidade_entrega: string;
  observacoes?: string;
  latitude_origem?: number;
  longitude_origem?: number;
  endereco_origem?: string;
}

export interface OT {
  id: number;
  numero_ot: string;
  cliente_nome: string;
  endereco_entrega: string;
  cidade_entrega: string;
  observacoes: string;
  status: 'INICIADA' | 'EM_CARREGAMENTO' | 'EM_TRANSITO' | 'ENTREGUE' | 'ENTREGUE_PARCIAL' | 'CANCELADA';
  
  // Localização
  latitude_origem?: number;
  longitude_origem?: number;
  endereco_origem?: string;
  latitude_entrega?: number;
  longitude_entrega?: number;
  endereco_entrega_real?: string;
  
  // Datas
  data_criacao: string;
  data_atualizacao: string;
  data_finalizacao?: string;
  
  // Relacionamentos
  motorista_criador: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
  motorista_atual: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
  
  // Status
  ativa: boolean;
}

export interface CriarOTResponse {
  success: boolean;
  message: string;
  data?: OT;
  errors?: any;
}

export interface ListarOTsResponse {
  success: boolean;
  message: string;
  data?: {
    results: OT[];
    count: number;
    next?: string;
    previous?: string;
  };
  errors?: any;
}

export interface DetalhesOTResponse {
  success: boolean;
  message: string;
  data?: OT;
  errors?: any;
}

export interface AtualizarStatusRequest {
  status: OT['status'];
  observacao?: string;
  latitude?: number;
  longitude?: number;
}

// ==============================================================================
// 🚚 SERVIÇO DE ORDENS DE TRANSPORTE
// ==============================================================================

export const otService = {
  
  // ==============================================================================
  // ➕ CRIAR NOVA OT
  // ==============================================================================
  
  async criarOT(dados: CriarOTRequest): Promise<CriarOTResponse> {
    try {
      console.log('🚚 OT Service: Criando nova OT...', dados);
      
      const response = await apiService.post<OT>('/ots/', dados);
      
      console.log('✅ OT Service: OT criada com sucesso:', response.data);
      
      return {
        success: true,
        message: 'OT criada com sucesso!',
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ OT Service: Erro ao criar OT:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Dados inválidos para criação da OT',
          errors: error.response.data
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Você precisa estar logado para criar uma OT',
          errors: { auth: ['Não autorizado'] }
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Você não tem permissão para criar OTs',
          errors: { permission: ['Sem permissão'] }
        };
      } else {
        return {
          success: false,
          message: 'Erro de conexão. Tente novamente.',
          errors: { network: ['Erro de rede'] }
        };
      }
    }
  },
  
  // ==============================================================================
  // 📋 LISTAR OTs DO USUÁRIO
  // ==============================================================================
  
  async listarOTs(filtros?: { status?: string; page?: number }): Promise<ListarOTsResponse> {
    try {
      console.log('📋 OT Service: Listando OTs...', filtros);
      
      const response = await apiService.get<{
        results: OT[];
        count: number;
        next?: string;
        previous?: string;
      }>('/ots/', filtros);
      
      console.log(`✅ OT Service: ${response.data.count} OTs encontradas`);
      
      return {
        success: true,
        message: `${response.data.count} OTs encontradas`,
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ OT Service: Erro ao listar OTs:', error);
      
      return {
        success: false,
        message: 'Erro ao carregar lista de OTs',
        errors: error.response?.data || { network: ['Erro de rede'] }
      };
    }
  },
  
  // ==============================================================================
  // 🔍 VER DETALHES DE UMA OT
  // ==============================================================================
  
  async obterDetalhesOT(id: number): Promise<DetalhesOTResponse> {
    try {
      console.log(`🔍 OT Service: Buscando detalhes da OT ${id}...`);
      
      const response = await apiService.get<OT>(`/ots/${id}/`);
      
      console.log('✅ OT Service: Detalhes obtidos:', response.data.numero_ot);
      
      return {
        success: true,
        message: 'Detalhes da OT carregados',
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ OT Service: Erro ao obter detalhes:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'OT não encontrada',
          errors: { notFound: ['OT não existe'] }
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Você não tem permissão para ver esta OT',
          errors: { permission: ['Sem permissão'] }
        };
      } else {
        return {
          success: false,
          message: 'Erro ao carregar detalhes da OT',
          errors: error.response?.data || { network: ['Erro de rede'] }
        };
      }
    }
  },
  
  // ==============================================================================
  // 🔄 ATUALIZAR STATUS DA OT
  // ==============================================================================
  
  async atualizarStatus(id: number, dados: AtualizarStatusRequest): Promise<CriarOTResponse> {
    try {
      console.log(`🔄 OT Service: Atualizando status da OT ${id}:`, dados);
      
      const response = await apiService.patch<OT>(`/ots/${id}/status/`, dados);
      
      console.log('✅ OT Service: Status atualizado:', response.data.status);
      
      return {
        success: true,
        message: `Status atualizado para ${response.data.status}`,
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ OT Service: Erro ao atualizar status:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Status inválido ou transição não permitida',
          errors: error.response.data
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Você não pode alterar o status desta OT',
          errors: { permission: ['Sem permissão'] }
        };
      } else {
        return {
          success: false,
          message: 'Erro ao atualizar status',
          errors: error.response?.data || { network: ['Erro de rede'] }
        };
      }
    }
  },
  
  // ==============================================================================
  // 🏁 FINALIZAR OT
  // ==============================================================================
  
  async finalizarOT(id: number, dados: {
    observacoes_entrega?: string;
    latitude_entrega?: number;
    longitude_entrega?: number;
    endereco_entrega_real?: string;
  }): Promise<CriarOTResponse> {
    try {
      console.log(`🏁 OT Service: Finalizando OT ${id}:`, dados);
      
      const response = await apiService.post<OT>(`/ots/${id}/finalizar/`, dados);
      
      console.log('✅ OT Service: OT finalizada:', response.data.numero_ot);
      
      return {
        success: true,
        message: 'OT finalizada com sucesso!',
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ OT Service: Erro ao finalizar OT:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Não é possível finalizar esta OT',
          errors: error.response.data
        };
      } else {
        return {
          success: false,
          message: 'Erro ao finalizar OT',
          errors: error.response?.data || { network: ['Erro de rede'] }
        };
      }
    }
  },
  
  // ==============================================================================
  // 🔄 TRANSFERIR OT
  // ==============================================================================
  
  async transferirOT(id: number, dados: {
    motorista_destino_id: number;
    motivo: string;
  }): Promise<CriarOTResponse> {
    try {
      console.log(`🔄 OT Service: Transferindo OT ${id}:`, dados);
      
      const response = await apiService.post(`/ots/${id}/transferir/`, dados);
      
      console.log('✅ OT Service: Transferência solicitada');
      
      return {
        success: true,
        message: 'Transferência solicitada com sucesso!',
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ OT Service: Erro ao transferir OT:', error);
      
      return {
        success: false,
        message: 'Erro ao solicitar transferência',
        errors: error.response?.data || { network: ['Erro de rede'] }
      };
    }
  }
};

export default otService;