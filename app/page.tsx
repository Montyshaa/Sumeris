import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cpu, Zap, Database, Users, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-white">Ciudad Tecnosocial</h1>
            </div>
            <div className="text-sm text-slate-400">v2025 MVP</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance">
            Construye tu
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
              {" "}
              Ciudad del Futuro
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto text-pretty">
            Diseña y gestiona una ciudad-estado tecnosocial en un futuro distópico. Equilibra producción, bienestar y
            sostenibilidad mientras compites por recursos.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-400/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Economía Completa</CardTitle>
              <CardDescription className="text-slate-400">
                Gestiona 5 recursos y 3 índices críticos para el éxito de tu ciudad
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-400/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-400/10 rounded-lg flex items-center justify-center mb-2">
                <Database className="w-6 h-6 text-teal-400" />
              </div>
              <CardTitle className="text-white">I+D Avanzado</CardTitle>
              <CardDescription className="text-slate-400">
                Investiga tecnologías en 3 árboles: socio-económico, eco-tech y aero-IA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-400/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-400/10 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-white">Combate PvP</CardTitle>
              <CardDescription className="text-slate-400">
                Entrena unidades y conquista territorios en combates asíncronos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-slate-800/30 border-slate-700 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Acceso Simplificado
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sin contraseñas ni emails. Solo elige tu nombre y comienza a jugar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/game">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold"
                >
                  Iniciar Juego
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Sistema en desarrollo - Fase: Cimientos</span>
          </div>
        </div>
      </main>
    </div>
  )
}
