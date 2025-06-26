import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ClothingZoomView({ route, navigation }) {
  const { item, pieces = [] } = route.params;
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [showZoomedView, setShowZoomedView] = useState(false);

  // Dimensions de l'image pour le calcul des coordonnées
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions({ width, height });
  };

  const handlePiecePress = (piece) => {
    setSelectedPiece(piece);
    setShowZoomedView(true);
  };

  const renderBoundingBoxes = () => {
    if (!pieces || pieces.length === 0 || !imageDimensions.width) return null;

    return pieces.map((piece, index) => {
      if (!piece.bounding_box) return null;

      const bbox = piece.bounding_box;
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const containerWidth = screenWidth;
      const containerHeight = containerWidth / imageAspectRatio;

      // Calculer les positions réelles basées sur les coordonnées normalisées
      const absoluteX = bbox.x * containerWidth;
      const absoluteY = bbox.y * containerHeight;
      const absoluteWidth = bbox.width * containerWidth;
      const absoluteHeight = bbox.height * containerHeight;

      return (
        <TouchableOpacity
          key={`bbox-${index}-${piece.piece_id || piece.id}`}
          style={[
            styles.boundingBox,
            {
              left: absoluteX,
              top: absoluteY,
              width: absoluteWidth,
              height: absoluteHeight,
            }
          ]}
          onPress={() => handlePiecePress(piece)}
          activeOpacity={0.7}
        >
          <View style={styles.boundingBoxContent}>
            <Text style={styles.boundingBoxLabel} numberOfLines={1}>
              {piece.name || piece.piece_type}
            </Text>
            <Ionicons name="scan-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      );
    });
  };

  const renderZoomedModal = () => {
    if (!selectedPiece || !selectedPiece.bounding_box) return null;

    const bbox = selectedPiece.bounding_box;
    
    return (
      <Modal
        visible={showZoomedView}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowZoomedView(false)}
      >
        <SafeAreaView style={styles.zoomedContainer}>
          <View style={styles.zoomedHeader}>
            <TouchableOpacity
              onPress={() => setShowZoomedView(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.zoomedTitle}>
              {selectedPiece.name || selectedPiece.piece_type}
            </Text>
          </View>

          <View style={styles.zoomedImageContainer}>
            {item.imageUrl && (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                pinchGestureEnabled={true}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.zoomedImage}
                  resizeMode="contain"
                />
                {/* Overlay pour mettre en évidence la zone */}
                <View style={styles.overlay}>
                  <View style={[
                    styles.highlightBox,
                    {
                      left: `${bbox.x * 100}%`,
                      top: `${bbox.y * 100}%`,
                      width: `${bbox.width * 100}%`,
                      height: `${bbox.height * 100}%`,
                    }
                  ]} />
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.zoomedInfo}>
            <Text style={styles.coordinatesText}>
              Position: x={Math.round(bbox.x * 100)}%, y={Math.round(bbox.y * 100)}%
            </Text>
            <Text style={styles.coordinatesText}>
              Taille: {Math.round(bbox.width * 100)}% × {Math.round(bbox.height * 100)}%
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vue détaillée - Zoom</Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color="#667eea" />
          <Text style={styles.instructionsText}>
            Touchez une zone colorée pour zoomer sur un vêtement spécifique
          </Text>
        </View>

        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              onLoad={handleImageLoad}
              resizeMode="contain"
            />
            {/* Superposition des bounding boxes */}
            <View style={styles.overlayContainer}>
              {renderBoundingBoxes()}
            </View>
          </View>
        )}

        <View style={styles.piecesInfo}>
          <Text style={styles.sectionTitle}>
            Pièces détectées ({pieces.length})
          </Text>
          {pieces.map((piece, index) => (
            <TouchableOpacity
              key={`piece-${index}-${piece.piece_id || piece.id}`}
              style={styles.pieceCard}
              onPress={() => handlePiecePress(piece)}
            >
              <View style={styles.pieceHeader}>
                <Text style={styles.pieceName}>
                  {piece.name || piece.piece_type}
                </Text>
                <Ionicons name="search" size={20} color="#667eea" />
              </View>
              {piece.bounding_box && (
                <Text style={styles.pieceCoordinates}>
                  Position: {Math.round(piece.bounding_box.x * 100)}%, {Math.round(piece.bounding_box.y * 100)}%
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {renderZoomedModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#4338ca',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 12,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 30,
  },
  boundingBoxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  boundingBoxLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 80,
  },
  piecesInfo: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 15,
  },
  pieceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pieceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  pieceCoordinates: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Modal styles
  zoomedContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  zoomedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    marginRight: 15,
  },
  zoomedTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  zoomedImageContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  zoomedImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  highlightBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 8,
  },
  zoomedInfo: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  coordinatesText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
});