import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface BillData {
  billId: string;
  templateName: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  customFields?: Record<string, any>;
}

export class BillPDFGenerator {
  private doc: jsPDF;
  
  constructor() {
    this.doc = new jsPDF();
  }

  async generatePDF(billData: BillData): Promise<Blob> {
    this.doc = new jsPDF();
    
    // Set up the document
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 0, 0);
    
    // Header
    this.doc.setFontSize(24);
    this.doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Company info (left side)
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Your Company Name', 20, 40);
    this.doc.text('123 Business Street', 20, 45);
    this.doc.text('City, State 12345', 20, 50);
    this.doc.text('contact@company.com', 20, 55);
    this.doc.text('(555) 123-4567', 20, 60);
    
    // Bill info (right side)
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Bill #${billData.billNumber}`, 140, 40);
    this.doc.text(`Date: ${new Date(billData.issueDate).toLocaleDateString()}`, 140, 47);
    this.doc.text(`Due: ${new Date(billData.dueDate).toLocaleDateString()}`, 140, 54);
    this.doc.text(`Status: ${billData.status.toUpperCase()}`, 140, 61);
    
    // Client info
    this.doc.setFontSize(12);
    this.doc.text('Bill To:', 20, 80);
    this.doc.setFontSize(11);
    this.doc.setTextColor(50, 50, 50);
    this.doc.text(billData.clientName, 20, 87);
    if (billData.clientEmail) this.doc.text(billData.clientEmail, 20, 93);
    if (billData.clientPhone) this.doc.text(billData.clientPhone, 20, 99);
    if (billData.clientAddress) {
      const addressLines = billData.clientAddress.split('\n');
      addressLines.forEach((line, index) => {
        this.doc.text(line, 20, 105 + (index * 6));
      });
    }
    
    // Items table
    let yPosition = 130;
    
    // Table headers
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(20, yPosition, 170, 8, 'F');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Description', 25, yPosition + 5);
    this.doc.text('Quantity', 100, yPosition + 5);
    this.doc.text('Unit Price', 130, yPosition + 5);
    this.doc.text('Total', 160, yPosition + 5);
    
    yPosition += 8;
    
    // Table rows
    billData.items.forEach((item) => {
      this.doc.setTextColor(50, 50, 50);
      this.doc.text(item.description, 25, yPosition + 5);
      this.doc.text(item.quantity.toString(), 100, yPosition + 5);
      this.doc.text(`$${item.unitPrice.toFixed(2)}`, 130, yPosition + 5);
      this.doc.text(`$${item.total.toFixed(2)}`, 160, yPosition + 5);
      yPosition += 8;
    });
    
    // Summary
    yPosition += 10;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    this.doc.setFontSize(11);
    this.doc.text('Subtotal:', 140, yPosition);
    this.doc.text(`$${billData.subtotal.toFixed(2)}`, 160, yPosition);
    yPosition += 7;
    
    if (billData.taxRate > 0) {
      this.doc.text(`Tax (${billData.taxRate}%):`, 140, yPosition);
      this.doc.text(`$${billData.taxAmount.toFixed(2)}`, 160, yPosition);
      yPosition += 7;
    }
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Total:', 140, yPosition);
    this.doc.text(`$${billData.total.toFixed(2)}`, 160, yPosition);
    
    // Notes
    if (billData.notes) {
      yPosition += 20;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Notes:', 20, yPosition);
      yPosition += 5;
      const noteLines = this.doc.splitTextToSize(billData.notes, 150);
      this.doc.text(noteLines, 20, yPosition);
    }
    
    // Custom fields
    if (billData.customFields && Object.keys(billData.customFields).length > 0) {
      yPosition = 250;
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Additional Information:', 20, yPosition);
      yPosition += 7;
      
      Object.entries(billData.customFields).forEach(([key, value]) => {
        if (value) {
          this.doc.text(`${key}: ${value}`, 20, yPosition);
          yPosition += 5;
        }
      });
    }
    
    // Footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    
    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  async generatePDFFromHTML(elementId: string): Promise<Blob> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const billPDFGenerator = new BillPDFGenerator();
