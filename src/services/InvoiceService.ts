// services/InvoiceService.ts
import { jsPDF } from 'jspdf';

interface Performance {
  perfName: string;
  perfPrice: number;
}

interface Client {
  clientName: string;
  clientAddress: string;
}

export const generateInvoice = (
  appointmentId: number,
  client: Client,
  performances: Performance[]
) => {
  const doc = new jsPDF();

  // En-tête
  doc.setFontSize(22);
  doc.text('FACTURE', 105, 20, { align: 'center' });

  // Informations de l'entreprise
  doc.setFontSize(12);
  doc.text('NurseCare', 20, 40);
  doc.text('123 Rue de la Santé', 20, 47);
  doc.text('31000 Toulouse', 20, 54);

  // Informations client et facture
  doc.text(`Facture N°: ${appointmentId}`, 20, 70);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 77);
  doc.text('Client:', 20, 90);
  doc.text(client.clientName || 'Non renseigné', 20, 97);
  doc.text(client.clientAddress || 'Non renseigné', 20, 104);

  // Table des prestations
  let y = 120;
  doc.line(20, y, 190, y);
  y += 10;

  doc.text('Prestation', 20, y);
  doc.text('Prix', 170, y);

  y += 10;
  doc.line(20, y, 190, y);
  y += 10;

  let total = 0;
  performances.forEach(perf => {
    doc.text(perf.perfName, 20, y);
    doc.text(`${perf.perfPrice.toFixed(2)}€`, 170, y);
    y += 10;
    total += perf.perfPrice;
  });

  // Total
  y += 5;
  doc.line(20, y, 190, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, y);
  doc.text(`${total.toFixed(2)}€`, 170, y);

  return {
    doc,
    total,
    date: new Date().toISOString().split('T')[0]
  };
};
