import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Irmao } from '@/types';
import { cn } from '@/lib/utils';

interface CarteirinhaModalProps {
  irmao: Irmao;
  validityYear: string;
  onClose: () => void;
}

export function CarteirinhaModal({ irmao, validityYear, onClose }: CarteirinhaModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 54], // Standard ID card size
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
    pdf.save(`carteirinha-${irmao.numero_registro}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-primary">Carteira de Identificação</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-surface-container-low">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Visual Preview of the Card */}
          <div 
            ref={cardRef}
            className="relative h-[204px] w-[323px] overflow-hidden rounded-[12px] text-white shadow-xl"
            style={{ 
              width: '85.6mm', 
              height: '54mm',
              background: 'linear-gradient(to bottom right, #af2b3e, #8e2332)'
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[20px] border-white"></div>
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full border-[30px] border-white"></div>
            </div>

            <div className="relative flex h-full flex-col pt-3 px-4 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded bg-white p-1">
                    <img 
                      src="https://jnilhegxnaaheezsgytw.supabase.co/storage/v1/object/public/images/Logo.png" 
                      alt="Logo Supremo" 
                      className="h-full w-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="text-[8px] font-bold uppercase leading-tight">Supremo Grande Capítulo</p>
                    <p className="text-[11px] font-serif font-bold leading-tight">Arco Real de São Paulo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Membro Ativo</p>
                </div>
              </div>

              {/* Middle Content */}
              <div className="mt-1 flex flex-1 space-x-4">
                <div className="mt-1 h-20 w-16 shrink-0 overflow-hidden rounded border" style={{ borderColor: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                  {irmao.foto_url ? (
                    <img src={irmao.foto_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                      <span className="text-2xl font-bold">?</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-0.5">
                  <p className="text-[13px] font-bold leading-tight uppercase">{irmao.nome_completo}</p>
                  <p className="text-[9px] font-medium text-secondary">{irmao.cargo}</p>
                  
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <div>
                      <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Registro</p>
                      <p className="text-[9px] font-bold">{irmao.numero_registro}</p>
                    </div>
                    <div>
                      <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>CPF</p>
                      <p className="text-[9px] font-bold">{irmao.cpf}</p>
                    </div>
                    <div>
                      <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Admissão</p>
                      <p className="text-[9px] font-bold">{new Date(irmao.data_admissao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[6px] uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Validade</p>
                      <p className="text-[9px] font-bold">31/12/{validityYear}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between border-t pt-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <p className="text-[6px] italic" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Este documento é de uso pessoal e intransferível.</p>
              </div>
            </div>
          </div>

          <div className="flex w-full space-x-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button variant="secondary" className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
