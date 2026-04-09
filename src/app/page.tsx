import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import type { Categoria } from "@/types";

const CATEGORIES: Categoria[] = [
  "plomeria",
  "electricidad",
  "carpinteria",
  "pintura",
  "limpieza",
  "jardineria",
  "cerrajeria",
  "otros",
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Oficios a domicilio en{" "}
          <span className="text-blue-600">Cali</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Conectamos a caleños con maestros de obra, electricistas, plomeros y
          más — rápido, confiable y cerca de tu casa.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/servicios"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Buscar un oficio
          </Link>
          <Link
            href="/publicar"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Ofrecer mis servicios
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ¿Qué necesitas hoy?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat} category={cat} />
          ))}
        </div>
      </section>

      {/* Map CTA */}
      <section className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Encuentra maestros cerca de ti
        </h2>
        <p className="text-gray-500 mb-6">
          Explora el mapa y ubica proveedores en tu barrio.
        </p>
        <Link
          href="/mapa"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block"
        >
          Ver mapa
        </Link>
      </section>
    </div>
  );
}
