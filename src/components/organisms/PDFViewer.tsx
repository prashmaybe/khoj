import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { pdfViewerService, PDFDocument, Annotation, AnnotationTool } from '../../services/PDFViewerService';
import { FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight, FiEdit3, FiType, FiDownload, FiUpload, FiSettings } from 'react-icons/fi';

interface PDFViewerProps {
  visible: boolean;
  documentId?: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ visible, documentId, onClose }) => {
  const { colors } = useTheme();
  const [document, setDocument] = useState<PDFDocument | null>(null);
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
  const [showSettings, setShowSettings] = useState(false);
  
  const canvasRef = useRef<any>(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const updateDimensions = () => setWindowWidth(Dimensions.get('window').width);
    Dimensions.addEventListener('change', updateDimensions);
    return () => Dimensions.removeEventListener('change', updateDimensions);
  }, []);

  useEffect(() => {
    if (visible && documentId) {
      const documents = pdfViewerService.loadPDFDocuments();
      const doc = documents.find(d => d.id === documentId);
      setDocument(doc || null);
      setCurrentPage(doc?.currentPage || 1);
      setZoom(doc?.zoom || 1.0);
    }
  }, [visible, documentId]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.25, 5.0);
    setZoom(newZoom);
    if (document) {
      pdfViewerService.setZoom(document.id, newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.25, 0.5);
    setZoom(newZoom);
    if (document) {
      pdfViewerService.setZoom(document.id, newZoom);
    }
  };

  const handleNextPage = () => {
    if (!document) return;
    pdfViewerService.nextPage(document.id, currentPage);
    setCurrentPage(prev => Math.min(prev + 1, document.pageCount || 1));
  };

  const handlePreviousPage = () => {
    if (!document) return;
    pdfViewerService.previousPage(document.id, currentPage);
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleToolSelect = (tool: AnnotationTool) => {
    setSelectedTool(tool);
    setIsAnnotating(tool.type !== 'select');
  };

  const handleCanvasClick = (event: any) => {
    if (!document || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool.type === 'highlight') {
      // Add highlight annotation
      const annotation: Annotation = {
        id: Date.now().toString(),
        type: 'highlight',
        content: `Highlight at ${new Date().toLocaleTimeString()}`,
        position: { x, y, width: 100, height: 20, page: currentPage },
        color: annotationColor,
        timestamp: new Date().toISOString(),
      };
      
      pdfViewerService.addAnnotation(document.id, annotation);
      setIsAnnotating(false);
      setSelectedTool({ type: 'select' });
    } else if (selectedTool.type === 'note') {
      setShowAnnotationModal(true);
    }
  };

  const handleAddAnnotation = () => {
    if (!document || !annotationText.trim()) return;

    const annotation: Annotation = {
      id: Date.now().toString(),
      type: 'note',
      content: annotationText,
      position: { x: 100, y: 100, width: 200, height: 50, page: currentPage },
      color: annotationColor,
      timestamp: new Date().toISOString(),
    };

    pdfViewerService.addAnnotation(document.id, annotation);
    setAnnotationText('');
    setShowAnnotationModal(false);
    setIsAnnotating(false);
    setSelectedTool({ type: 'select' });
  };

  const handleSearch = () => {
    if (!document) return;
    
    const results = pdfViewerService.searchInDocument(document.id, searchQuery);
    setShowSearchResults(results.length > 0);
  };

  const handleExport = () => {
    if (!document) return;

    Alert.alert(
      'Export Annotations',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'JSON', onPress: () => {
          const exported = pdfViewerService.exportAnnotations(document.id, 'json');
          if (exported) {
            // In a real app, this would trigger a file download
            Alert.alert('Success', 'Annotations exported as JSON');
          }
        }},
        { text: 'Text', onPress: () => {
          const exported = pdfViewerService.exportAnnotations(document.id, 'txt');
          if (exported) {
            // In a real app, this would trigger a file download
            Alert.alert('Success', 'Annotations exported as text file');
          }
        }},
      ]
    );
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const renderPDFCanvas = () => {
    if (!document) return null;

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
                Page {currentPage} / {document.pageCount || 1}
              </Text>
              
              <TouchableOpacity
                style={[styles.toolbarButton, { backgroundColor: colors.buttonSecondary }]}
                onPress={handleNextPage}
                disabled={currentPage >= (document.pageCount || 1)}
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
              
              <Text style={[styles.zoomInfo, { color: colors.text }]}>
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
                <FiHighlighter size={20} color={selectedTool.type === 'highlight' ? colors.buttonPrimaryText : colors.buttonSecondaryText} />
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
                onPress={handleSettings}
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
          <canvas
            ref={canvasRef}
            style={[
              styles.pdfCanvas,
              { backgroundColor: colors.background }
            ]}
            onClick={handleCanvasClick}
          />
        </View>

        {/* Page Info */}
        <View style={[styles.pageInfoBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            {document.title}
          </Text>
          <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
            {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
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

        {document ? renderPDFCanvas() : (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <FiUpload size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No PDF document loaded
            </Text>
            <TouchableOpacity
              style={[styles.loadButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={() => {
                // In a real app, this would open a file picker
                Alert.alert('Info', 'File picker would open here to load PDF files');
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
    width: windowWidth - 32,
    height: 400,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
