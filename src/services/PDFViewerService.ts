export interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'drawing' | 'text';
  content: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    page: number;
  };
  color?: string;
  author?: string;
  timestamp: string;
}

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  textContent?: string;
  annotations: Annotation[];
}

export interface PDFDocument {
  id: string;
  title: string;
  url: string;
  fileSize: number;
  lastModified: string;
  pageCount: number;
  currentPage: number;
  zoom: number;
  annotations: Annotation[];
  createdAt: string;
  lastAccessed: string;
}

export interface AnnotationTool {
  type: 'select' | 'highlight' | 'note' | 'draw' | 'text' | 'eraser';
  color?: string;
  strokeWidth?: number;
  fontSize?: number;
}

class PDFViewerService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private isPDFFile(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
  }

  // PDF Loading and Rendering
  async loadPDFDocument(file: File | ArrayBuffer): Promise<PDFDocument | null> {
    try {
      let arrayBuffer: ArrayBuffer;
      
      if (file instanceof ArrayBuffer) {
        arrayBuffer = file;
      } else {
        arrayBuffer = await file.arrayBuffer();
      }

      // Use PDF.js to get actual page count
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.js';
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const actualPageCount = pdf.numPages;
      
      const pdfDocument: PDFDocument = {
        id: Date.now().toString(),
        title: file instanceof File ? file.name : 'PDF Document',
        url: URL.createObjectURL(new Blob([arrayBuffer], { type: 'application/pdf' })),
        fileSize: arrayBuffer.byteLength,
        lastModified: file instanceof File ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
        pageCount: actualPageCount,
        currentPage: 1,
        zoom: 1.0,
        annotations: [],
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      };

      return pdfDocument;
    } catch (error) {
      console.error('Error loading PDF document:', error);
      return null;
    }
  }

  // Annotation Management
  addAnnotation(documentId: string, annotation: Omit<Annotation, 'id'>): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        const newAnnotation: Annotation = {
          ...annotation,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        document.annotations.push(newAnnotation);
        this.savePDFDocuments(documents);
      }
    } catch (error) {
      console.error('Error adding annotation:', error);
    }
  }

  removeAnnotation(documentId: string, annotationId: string): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        document.annotations = document.annotations.filter(ann => ann.id !== annotationId);
        this.savePDFDocuments(documents);
      }
    } catch (error) {
      console.error('Error removing annotation:', error);
    }
  }

  updateAnnotation(documentId: string, annotationId: string, updates: Partial<Annotation>): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        const annotationIndex = document.annotations.findIndex(ann => ann.id === annotationId);
        if (annotationIndex !== -1) {
          document.annotations[annotationIndex] = {
            ...document.annotations[annotationIndex],
            ...updates,
            timestamp: new Date().toISOString(),
          };
          this.savePDFDocuments(documents);
        }
      }
    } catch (error) {
      console.error('Error updating annotation:', error);
    }
  }

  getAnnotations(documentId: string): Annotation[] {
    if (!this.isClient()) return [];

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      return document ? document.annotations : [];
    } catch (error) {
      console.error('Error getting annotations:', error);
      return [];
    }
  }

  // PDF Document Management
  private loadPDFDocuments(): PDFDocument[] {
    if (!this.isClient()) return [];

    try {
      const stored = localStorage.getItem('khoj_pdf_documents');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading PDF documents:', error);
      return [];
    }
  }

  private savePDFDocuments(documents: PDFDocument[]): void {
    if (!this.isClient()) return;

    try {
      localStorage.setItem('khoj_pdf_documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving PDF documents:', error);
    }
  }

  // PDF Navigation
  goToPage(documentId: string, pageNumber: number): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        document.currentPage = Math.max(1, Math.min(pageNumber, document.pageCount || 1));
        document.lastAccessed = new Date().toISOString();
        this.savePDFDocuments(documents);
      }
    } catch (error) {
      console.error('Error going to page:', error);
    }
  }

  nextPage(documentId: string): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        document.currentPage = Math.min(document.currentPage + 1, document.pageCount || 1);
        document.lastAccessed = new Date().toISOString();
        this.savePDFDocuments(documents);
      }
    } catch (error) {
      console.error('Error going to next page:', error);
    }
  }

  previousPage(documentId: string): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        document.currentPage = Math.max(1, document.currentPage - 1);
        document.lastAccessed = new Date().toISOString();
        this.savePDFDocuments(documents);
      }
    } catch (error) {
      console.error('Error going to previous page:', error);
    }
  }

  // Zoom Management
  setZoom(documentId: string, zoom: number): void {
    if (!this.isClient()) return;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (document) {
        document.zoom = Math.max(0.5, Math.min(zoom, 5.0)); // Min 50%, Max 500%
        document.lastAccessed = new Date().toISOString();
        this.savePDFDocuments(documents);
      }
    } catch (error) {
      console.error('Error setting zoom:', error);
    }
  }

  getZoom(documentId: string): number {
    if (!this.isClient()) return 1.0;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      return document ? document.zoom : 1.0;
    } catch (error) {
      console.error('Error getting zoom:', error);
      return 1.0;
    }
  }

  // Search functionality
  searchInDocument(documentId: string, query: string): Annotation[] {
    if (!this.isClient() || !query.trim()) return [];

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (!document) return [];

      const lowerQuery = query.toLowerCase();
      return document.annotations.filter(annotation => 
        annotation.content.toLowerCase().includes(lowerQuery) ||
        (annotation.author && annotation.author.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching in document:', error);
      return [];
    }
  }

  // Export functionality
  exportAnnotations(documentId: string, format: 'json' | 'txt' = 'json'): string | null {
    if (!this.isClient()) return null;

    try {
      const documents = this.loadPDFDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (!document || document.annotations.length === 0) return null;

      if (format === 'json') {
        return JSON.stringify(document.annotations, null, 2);
      } else if (format === 'txt') {
        return document.annotations
          .map(ann => `${ann.type}: ${ann.content}`)
          .join('\n');
      }
      
      return null;
    } catch (error) {
      console.error('Error exporting annotations:', error);
      return null;
    }
  }

  // Utility functions
  generateDocumentId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  validatePDFFile(file: File): boolean {
    if (!file) return false;
    
    const validTypes = ['application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    return validTypes.indexOf(file.type) !== -1 && file.size <= maxSize;
  }

  // PDF text extraction (simplified)
  async extractPDFText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Basic text extraction from PDF binary data
      // This is a simplified implementation - real implementation would use PDF.js
      const uint8Array = new Uint8Array(arrayBuffer);
      let extractedText = '';
      
      // Look for text strings in PDF (very basic approach)
      const textStrings: string[] = [];
      let inText = false;
      let currentText = '';
      
      for (let i = 0; i < uint8Array.length - 1; i++) {
        const char = String.fromCharCode(uint8Array[i]);
        const nextChar = String.fromCharCode(uint8Array[i + 1]);
        
        // Look for text string patterns in PDF
        if (char === '(' && !inText) {
          inText = true;
          currentText = '';
        } else if (char === ')' && inText) {
          inText = false;
          if (currentText.length > 1) {
            textStrings.push(currentText);
          }
        } else if (inText) {
          currentText += char;
        }
      }
      
      // Clean up and format extracted text
      extractedText = textStrings
        .filter(text => text.trim().length > 0)
        .join(' ')
        .replace(/\\([nrt])/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length === 0) {
        return `PDF text extraction completed for file: ${file.name}. No readable text content found or text extraction requires PDF.js library for full functionality.`;
      }
      
      return extractedText.substring(0, 10000); // Limit to first 10k characters
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return `Error extracting text from PDF: ${file.name}. This feature requires PDF.js library for full functionality.`;
    }
  }

  // Recent documents management
  getRecentDocuments(limit: number = 10): PDFDocument[] {
    if (!this.isClient()) return [];

    try {
      const documents = this.loadPDFDocuments();
      return documents
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent documents:', error);
      return [];
    }
  }

  // Clear document cache
  clearDocumentCache(): void {
    if (!this.isClient()) return;

    try {
      localStorage.removeItem('khoj_pdf_documents');
    } catch (error) {
      console.error('Error clearing document cache:', error);
    }
  }
}

export const pdfViewerService = new PDFViewerService();
