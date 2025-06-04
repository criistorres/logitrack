export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚛 LogiTrack
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema de Gerenciamento de Transporte - Frontend configurado com sucesso!
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatusCard 
            title="✅ Next.js 14+" 
            description="App Router configurado" 
            status="Funcionando"
          />
          <StatusCard 
            title="✅ TypeScript" 
            description="Tipagem estática ativa" 
            status="Configurado"
          />
          <StatusCard 
            title="✅ Tailwind CSS" 
            description="Estilização responsiva" 
            status="Pronto"
          />
        </div>

        {/* Info Panel */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Etapa 1.1 - Frontend Básico ✅
          </h2>
          <p className="text-gray-600 mb-6">
            Estrutura básica do projeto LogiTrack criada com sucesso. 
            O projeto está pronto para desenvolvimento!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              🎉 Setup completo! Execute `npm run dev` para começar a desenvolver.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatusCard({ title, description, status }: { 
  title: string
  description: string 
  status: string 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
        {status}
      </span>
    </div>
  )
}