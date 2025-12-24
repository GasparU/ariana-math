import React, { useEffect, useState } from "react";
import {
  Globe,
  MapPin,
  Users,
  Calendar,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api"; // Asegúrate de tener el fetch aquí
import MainLayout from "../../components/layout/MainLayout";

const AnalyticsDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      // Usaremos un método que añadiremos a api.js
      const stats = await api.results.getAnalytics();
      setData(stats || []);
      setLoading(false);
    };
    loadStats();
  }, []);

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <BarChart3 className="text-indigo-600" /> Radar de Reclutadores
            </h1>
            <p className="text-slate-500 text-sm">
              Monitoreo geográfico de visitas al portafolio.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* TABLA DE VISITAS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                <th className="p-4">
                  <Calendar size={12} className="inline mr-1" /> Fecha
                </th>
                <th className="p-4">
                  <Users size={12} className="inline mr-1" /> Rol
                </th>
                <th className="p-4">
                  <Globe size={12} className="inline mr-1" /> País
                </th>
                <th className="p-4">
                  <MapPin size={12} className="inline mr-1" /> Ciudad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((visit) => (
                <tr
                  key={visit.id}
                  className="text-sm hover:bg-indigo-50/30 transition-colors"
                >
                  <td className="p-4 text-slate-500 font-medium">
                    {new Date(visit.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">
                      #{visit.visitor_id?.slice(-4) || "????"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">
                    {visit.country}
                  </td>
                  <td className="p-4 text-slate-500 italic">{visit.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-400">
              Aún no hay visitas registradas.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsDashboard;
