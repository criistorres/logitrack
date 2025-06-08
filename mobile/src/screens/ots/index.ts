// mobile/src/screens/ots/index.ts - ATUALIZADO COM LISTA DE OTs

// ==============================================================================
// 📱 EXPORTS DAS TELAS DE OT - VERSÃO COMPLETA
// ==============================================================================

/**
 * Arquivo central de exportação para todas as telas relacionadas a OTs
 * Facilita importações e mantém organização do código
 */

// Telas já implementadas
export { default as CriarOTScreen } from './CriarOTScreen';
export { default as ListaOTScreen } from './ListaOTScreen'

// Telas futuras (próximas implementações)
// export { default as DetalhesOTScreen } from './DetalhesOTScreen';
// export { default as TransferirOTScreen } from './TransferirOTScreen';
// export { default as FinalizarOTScreen } from './FinalizarOTScreen';
// export { default as UploadDocumentosScreen } from './UploadDocumentosScreen';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO RELACIONADOS A OTs
// ==============================================================================

/**
 * Tipos de parâmetros para navegação entre telas de OT
 * Use este tipo nas suas telas para tipagem correta
 */
export type OTStackParamList = {
  ListaOTs: undefined;
  DetalhesOT: { otId: number };
  CriarOT: undefined;
  TransferirOT: { otId: number };
  FinalizarOT: { otId: number };
  UploadDocumentos: { otId: number };
};