import { supabase } from "./api";

export const telemetry = {
  trackVisitor: async (role, action = "login_demo") => {
    try {
      // 1. Obtener o generar el ID Único del Visitante
      let vId = localStorage.getItem("app_visitor_identity");
      if (!vId) {
        vId = crypto.randomUUID(); // Genera un ID como '550e8400-e29b-...'
        localStorage.setItem("app_visitor_identity", vId);
      }

      const geoRes = await fetch("https://ipapi.co/json/");
      const geoData = await geoRes.json();

      // 2. Enviamos el visitor_id al insertar
      await supabase.from("analytics_tracking").insert({
        visitor_id: vId, // 🔥 Esto identifica a la persona
        visitor_role: role,
        country: geoData.country_name || "Unknown",
        city: geoData.city || "Unknown",
        action_performed: action,
        browser_info: navigator.userAgent.substring(0, 254),
      });
    } catch (err) {
      console.warn("Telemetría no disponible");
    }
  },
};
