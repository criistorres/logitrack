// mobile/src/screens/ots/index.ts - EXPORTS DAS TELAS DE ORDENS DE TRANSPORTE

// ==============================================================================
// 📋 EXPORTS DAS TELAS DE OTs
// ==============================================================================

// Tela de listagem de OTs
export { default as ListaOTScreen } from './ListaOTScreen';
export { default as ListaOTScreenFixed } from './ListaOTScreenFixed';

// Tela de criação de OT
export { default as CriarOTScreen } from './CriarOTScreen';
export { default as CriarOTScreenFixed } from './CriarOTScreenFixed';

// Tela de detalhes de OT
export { default as DetalhesOTScreen } from './DetalhesOTScreen';

// Tela de atualização de status - NOVA
export { default as AtualizarStatusScreen } from './AtualizarStatusScreen';
export { default as FinalizarOTScreen } from './FinalizarOTScreen';

// ==============================================================================
// 📋 TIPOS DE NAVEGAÇÃO (se necessário)
// ==============================================================================

// Re-export dos tipos de navegação das OTs
export type { OTsStackParamList } from '../../navigation/OTsStackNavigator';

// ==============================================================================
// ✅ ESTRUTURA FINAL DAS TELAS DE OT
// ==============================================================================

/**
 * 🎯 TELAS DISPONÍVEIS:
 * 
 * ✅ LISTA DE OTs:
 * - ListaOTScreen (versão original)
 * - ListaOTScreenFixed (versão atualizada com Tailwind)
 * 
 * ✅ CRIAÇÃO DE OT:
 * - CriarOTScreen (versão original)
 * - CriarOTScreenFixed (versão atualizada com fluxo em etapas)
 * 
 * ✅ DETALHES E AÇÕES DE OT:
 * - DetalhesOTScreen (visualização completa dos dados)
 * - AtualizarStatusScreen (fluxo guiado de atualização)
 * 
 * 🔄 NAVEGAÇÃO:
 * - OTsStackNavigator (stack navigation: Lista → Detalhes → Ações)
 * 
 * 🎯 USO RECOMENDADO:
 * - Use as versões "Fixed" que são as mais atualizadas
 * - DetalhesOTScreen para visualização completa
 * - AtualizarStatusScreen para mudanças de status guiadas
 * - Todas usam Tailwind CSS e SafeScreenWrapper
 * - Fluxo: Lista → Detalhes → Atualizar Status
 */