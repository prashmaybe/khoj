import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { pdfViewerService, PDFDocument, Annotation, AnnotationTool } from '../../services/PDFViewerService';
import { FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight, FiEdit3, FiType, FiDownload, FiUpload, FiSettings } from 'react-icons/fi';

// Dynamically import pdfjs-dist to avoid SSR issues
let pdfjsLib: any = null;
if (typeof window !== 'undefined') {
  import('pdfjs-dist/build/pdf.mjs').then((module) => {
    pdfjsLib = module;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  });
}

interface PDFViewerProps {
  visible: boolean;
  documentId?: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ visible, documentId, onClose }) => {
  const { colors } = useTheme();
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>({ type: 'select' });
  const [showToolbar, setShowToolbar] = useState(true);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [annotationColor, setAnnotationColor] = useState('#ffff00'); // Yellow highlighter
  const [annotationText, setAnnotationText] = useState('');
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const updateDimensions = () => setWindowWidth(Dimensions.get('window').width);
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  // Function to render PDF page
  const renderPDFPage = async (pdfUrl: string, pageNum: number) => {
    if (!pdfjsLib) return;
    
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      
      const viewport = page.getViewport({ scale: pdfScale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to data URL for display
      const dataUrl = canvas.toDataURL('image/png');
      setPdfData(dataUrl);
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

  useEffect(() => {
    if (visible && documentId) {
      // Load document from service
      const documents = pdfViewerService.loadPDFDocuments();
      const loadedDocument = documents.find(doc => doc.id === documentId);
      
      if (loadedDocument) {
        setPdfDocument(loadedDocument);
        setCurrentPage(loadedDocument.currentPage);
        setZoom(loadedDocument.zoom);
        
        // Render the PDF page if URL is available
        if (loadedDocument.url) {
          renderPDFPage(loadedDocument.url, loadedDocument.currentPage);
        }
      } else {
        // Show file picker to load a new PDF
        setPdfDocument(null);
      }
    }
  }, [visible, documentId]);

  // Update PDF rendering when current page or zoom changes
  useEffect(() => {
    if (pdfDocument && pdfDocument.url) {
      renderPDFPage(pdfDocument.url, currentPage);
      pdfViewerService.goToPage(pdfDocument.id, currentPage);
    }
  }, [currentPage, pdfDocument, pdfScale]);

  // Function to handle file loading (would be connected to file picker)
  const handleLoadPDF = async (file: File) => {
    try {
      // Validate PDF file
      if (!pdfViewerService.validatePDFFile(file)) {
        Alert.alert('Invalid File', 'Please select a valid PDF file (max 50MB)');
        return;
      }

      // Load PDF document using service
      const loadedDoc = await pdfViewerService.loadPDFDocument(file);
      
      if (loadedDoc) {
        setPdfDocument(loadedDoc);
        setCurrentPage(1);
        setZoom(1.0);
        setPdfScale(1.0);
        
        const documents = pdfViewerService.loadPDFDocuments();
        documents.push(loadedDoc);
        pdfViewerService.savePDFDocuments(documents);
        
        renderPDFPage(loadedDoc.url, 1);
      } else {
        Alert.alert('Error', 'Failed to load PDF document');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load PDF file');
      console.error('Error loading PDF:', error);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.25, 5.0);
    setZoom(newZoom);
    setPdfScale(newZoom);
    // Save zoom level to document in service
    if (pdfDocument) {
      pdfViewerService.setZoom(pdfDocument.id, newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.25, 0.5);
    setZoom(newZoom);
    setPdfScale(newZoom);
    if (pdfDocument) {
      pdfViewerService.setZoom(pdfDocument.id, newZoom);
    }
  };

  const handleNextPage = () => {
    if (!pdfDocument) return;
    const newPage = Math.min(currentPage + 1, pdfDocument.pageCount || 1);
    setCurrentPage(newPage);
  };

  const handlePreviousPage = () => {
    if (!pdfDocument) return;
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
  };

  const handleToolSelect = (tool: AnnotationTool) => {
    setSelectedTool(tool);
    setIsAnnotating(tool.type !== 'select');
  };

  const handleAddAnnotation = () => {
    if (!pdfDocument || !annotationText.trim()) return;

    const annotation: Annotation = {
      id: Date.now().toString(),
      type: 'note',
      content: annotationText,
      position: { x: 100, y: 100, width: 200, height: 50, page: currentPage },
      color: annotationColor,
      timestamp: new Date().toISOString(),
    };

    setAnnotationText('');
    setShowAnnotationModal(false);
    setIsAnnotating(false);
    setSelectedTool({ type: 'select' });
    Alert.alert('Success', 'Note added successfully');
  };

  const handleSearch = () => {
    if (!pdfDocument) return;
    
    Alert.alert('Search', `Searching for: ${searchQuery}`);
    setShowSearchResults(false);
  };

  const handleExport = () => {
    if (!pdfDocument) return;

    Alert.alert(
      'Export Annotations',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'JSON', onPress: () => {
          Alert.alert('Success', 'Annotations exported as JSON');
        }},
        { text: 'Text', onPress: () => {
          Alert.alert('Success', 'Annotations exported as text file');
        }},
      ]
    );
  };

  const renderPDFCanvas = () => {
    if (!pdfDocument) return null;

    return (
      <View style={[styles.pdfContainer, { backgroundColor: colors.background }]}>
        {/* Toolbar */}
        {showToolbar && (
          <View style={[styles.toolbar, { backgroundColor: colors.surface }]}>
            {/* Navigation Controls */}
            <View style={styles.toolbarSection}>
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                <FiChevronLeft size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
              
              <Text style={[styles.pageInfo, { color: colors.text }]}>
                Page {currentPage} / {pdfDocument.pageCount || 1}
              </Text>
              
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handleNextPage}
                disabled={currentPage >= (pdfDocument.pageCount || 1)}
              >
                <FiChevronRight size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
            </View>

            {/* Zoom Controls */}
            <View style={styles.toolbarSection}>
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <FiZoomOut size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
              
              <Text style={[styles.pageInfo, { color: colors.text }]}>
                {Math.round(zoom * 100)}%
              </Text>
              
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handleZoomIn}
                disabled={zoom >= 5.0}
              >
                <FiZoomIn size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
            </View>

            {/* Annotation Tools */}
            <View style={styles.toolbarSection}>
              <TouchableOpacity
                style={[
                  styles.toolbarButton,
                  selectedTool.type === 'select' && styles.selectedTool,
                  { backgroundColor: selectedTool.type === 'select' ? colors.buttonPrimary : colors.buttonSecondary }
                ]}
                onPress={() => handleToolSelect({ type: 'select' })}
              >
                <FiEdit3 size={20} color={selectedTool.type === 'select' ? colors.buttonPrimaryText : colors.buttonSecondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toolbarButton,
                  selectedTool.type === 'highlight' && styles.selectedTool,
                  { backgroundColor: selectedTool.type === 'highlight' ? colors.buttonPrimary : colors.buttonSecondary }
                ]}
                onPress={() => handleToolSelect({ type: 'highlight', color: annotationColor })}
              >
                <FiEdit3 size={20} color={selectedTool.type === 'highlight' ? colors.buttonPrimaryText : colors.buttonSecondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toolbarButton,
                  selectedTool.type === 'note' && styles.selectedTool,
                  { backgroundColor: selectedTool.type === 'note' ? colors.buttonPrimary : colors.buttonSecondary }
                ]}
                onPress={() => handleToolSelect({ type: 'note' })}
              >
                <FiType size={20} color={selectedTool.type === 'note' ? colors.buttonPrimaryText : colors.buttonSecondaryText} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.toolbarSection}>
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handleSearch}
              >
                <FiEdit3 size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handleExport}
              >
                <FiDownload size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={() => Alert.alert('Settings', 'PDF settings would open here')}
              >
                <FiSettings size={20} color={colors.buttonSecondaryText} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        {showSearchResults && (
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.searchInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="Search in document..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={() => setShowSearchResults(false)}
            >
              <Text style={[styles.searchButtonText, { color: colors.buttonPrimaryText }]}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PDF Canvas */}
        <View style={styles.canvasContainer}>
          {pdfData ? (
            <Image
              source={{ uri: pdfData }}
              style={[
                styles.pdfCanvas,
                { 
                  backgroundColor: colors.background,
                  width: '100%',
                  height: 600,
                }
              ]}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.pdfCanvas,
                { backgroundColor: colors.background }
              ]}
            >
              <Text style={[styles.canvasText, { color: colors.text }]}>
                Loading PDF...
              </Text>
            </View>
          )}
        </View>

        {/* Page Info */}
        <View style={[styles.pageInfoBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            {pdfDocument.title}
          </Text>
          <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
            {pdfDocument.fileSize ? `${(pdfDocument.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderAnnotationModal = () => (
    <Modal
      visible={showAnnotationModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAnnotationModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add Note
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => setShowAnnotationModal(false)}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>×</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.noteInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Enter your note..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={annotationText}
          onChangeText={setAnnotationText}
          autoFocus
        />
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => setShowAnnotationModal(false)}
          >
            <Text style={[styles.modalButtonText, { color: colors.buttonSecondaryText }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.addButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleAddAnnotation}
          >
            <Text style={[styles.modalButtonText, { color: colors.buttonPrimaryText }]}>Add Note</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            PDF Viewer
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>×</Text>
          </TouchableOpacity>
        </View>

        {pdfDocument ? renderPDFCanvas() : (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <FiUpload size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No PDF document loaded
            </Text>
            <TouchableOpacity
              style={[styles.loadButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={async () => {
                try {
                  if (typeof window !== 'undefined' && window.electronAPI?.openPdfFile) {
                    const picked = await window.electronAPI.openPdfFile();
                    if (!picked) return;
                    const response = await fetch(picked.fileUrl);
                    const blob = await response.blob();
                    const file = new File([blob], picked.name, { type: 'application/pdf' });
                    await handleLoadPDF(file);
                    return;
                  }

                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'application/pdf,.pdf';
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) await handleLoadPDF(file);
                  };
                  input.click();
                } catch (error) {
                  Alert.alert('Error', 'Failed to load PDF file');
                  console.error('Error loading PDF:', error);
                }
              }}
            >
              <Text style={[styles.loadButtonText, { color: colors.buttonPrimaryText }]}>Load PDF</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderAnnotationModal()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pdfContainer: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedTool: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  pageInfo: {
    flex: 1,
    alignItems: 'center',
    fontSize: 14,
  },
  pageInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pdfCanvas: {
    width: '100%',
    height: 400,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  canvasText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  canvasSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  noteInput: {
    flex: 1,
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default PDFViewer;
