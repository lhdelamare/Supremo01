import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Irmao } from '@/types';
import { cn } from '@/lib/utils';

interface CarteirinhaModalProps {
  irmao: Irmao;
  onClose: () => void;
}

export function CarteirinhaModal({ irmao, onClose }: CarteirinhaModalProps) {
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
            className="relative h-[204px] w-[323px] overflow-hidden rounded-[12px] bg-gradient-to-br from-primary to-primary-container text-white shadow-xl"
            style={{ width: '85.6mm', height: '54mm' }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[20px] border-white"></div>
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full border-[30px] border-white"></div>
            </div>

            <div className="relative flex h-full flex-col p-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded bg-white p-1">
                    <span className="text-primary font-bold text-lg">S</span>
                  </div>
                  <div className="ml-2">
                    <p className="text-[8px] font-bold uppercase leading-tight">Supremo Grande Capítulo</p>
                    <p className="text-[10px] font-serif font-bold leading-tight">Arco Real de São Paulo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-widest text-white/70">Membro Ativo</p>
                </div>
              </div>

              <div className="mt-4 flex flex-1 space-x-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded border border-white/30 bg-white/10">
                  {irmao.foto_url ? (
                    <img src={irmao.foto_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/30">
                      <span className="text-2xl font-bold">?</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <p className="text-[12px] font-bold leading-tight uppercase">{irmao.nome_completo}</p>
                  <p className="text-[9px] font-medium text-secondary">{irmao.cargo}</p>
                  
                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                    <div>
                      <p className="text-[6px] uppercase text-white/60">Registro</p>
                      <p className="text-[8px] font-bold">{irmao.numero_registro}</p>
                    </div>
                    <div>
                      <p className="text-[6px] uppercase text-white/60">CPF</p>
                      <p className="text-[8px] font-bold">{irmao.cpf}</p>
                    </div>
                    <div>
                      <p className="text-[6px] uppercase text-white/60">Admissão</p>
                      <p className="text-[8px] font-bold">{new Date(irmao.data_admissao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[6px] uppercase text-white/60">Validade</p>
                      <p className="text-[8px] font-bold">31/12/2025</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-2">
                <p className="text-[6px] text-white/50 italic">Este documento é de uso pessoal e intransferível.</p>
                <div className="h-6 w-6 bg-white rounded p-0.5">
                  {/* Mock QR Code */}
                  <div className="grid grid-cols-3 grid-rows-3 gap-0.5 h-full w-full">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className={cn("bg-black", Math.random() > 0.5 ? "opacity-100" : "opacity-0")}></div>
                    ))}
                  </div>
                </div>
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
