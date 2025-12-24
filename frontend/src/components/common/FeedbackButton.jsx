import React from "react";
import { MessageSquarePlus } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../../services/api";


const FeedbackButton = () => {
  const openFeedback = async () => {
    const { value: formValues } = await Swal.fire({
      title: "¡Tu opinión importa!",
      html:
        '<p class="text-xs text-slate-500 mb-4">¿Qué te pareció esta plataforma de IA?</p>' +
        '<input id="swal-input1" class="swal2-input" placeholder="Tu nombre (opcional)">' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="Déjame tus puntos a mejorar o impresiones..."></textarea>',
      focusConfirm: false,
      background: "#ffffff",
      confirmButtonText: "Enviar Comentario",
      confirmButtonColor: "#4f46e5",
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      preConfirm: () => {
        return [
          document.getElementById("swal-input1").value,
          document.getElementById("swal-input2").value,
        ];
      },
    });

    if (formValues && formValues[1]) {
      try {
        const vId = localStorage.getItem("app_visitor_identity");
        const { error } = await supabase.from("visitor_feedback").insert({
          visitor_name: formValues[0] || "Anónimo",
          message: formValues[1],
          visitor_id: vId,
        });

        if (error) throw error;

        Swal.fire({
          icon: "success",
          title: "¡Gracias!",
          text: "Tu feedback me ayuda a seguir mejorando.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (e) {
        Swal.fire("Error", "No se pudo enviar el mensaje.", "error");
      }
    }
  };

  return (
    <button
      onClick={openFeedback}
      className="fixed bottom-6 right-6 z-[100] p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/40 transition-all active:scale-90 group"
      title="Dejar Feedback"
    >
      <div className="flex items-center gap-2">
        <MessageSquarePlus size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs font-bold uppercase tracking-widest">
          Feedback
        </span>
      </div>
    </button>
  );
};

export default FeedbackButton;
