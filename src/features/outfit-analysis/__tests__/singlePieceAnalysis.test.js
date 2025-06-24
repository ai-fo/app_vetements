/**
 * Tests pour l'analyse de pièces uniques
 */
import { outfitAnalysisAPI } from '../api';
import { openaiService } from '../services/openaiService';

describe('Single Piece Analysis', () => {
  // Mock des données de test
  const mockImageUri = 'file:///test/image.jpg';
  const mockUserId = 'test-user-123';
  
  const mockSinglePieceResponse = {
    type: 'single_piece',
    style: 'casual',
    category: 'piece_unique',
    colors: { primary: ['blanc', 'noir'], secondary: [] },
    material: 'coton',
    pattern: 'uni',
    occasion: 'quotidien',
    season: ['spring', 'summer'],
    care_instructions: 'laver à 30°',
    brand_style: 'streetwear',
    recommendations: ['Parfait avec un jean noir', 'Idéal pour un look décontracté'],
    confidence: 0.90,
    pieces: [{
      type: 'tshirt',
      name: 'T-shirt blanc basique',
      color: 'blanc',
      material: 'coton',
      brand_estimation: null,
      price_range: '20-50€',
      style: 'casual',
      fit: 'regular'
    }]
  };

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
  });

  test('devrait analyser correctement une pièce unique (T-shirt)', async () => {
    // Mock de la réponse OpenAI
    openaiService.analyzeOutfit = jest.fn().mockResolvedValue({
      data: mockSinglePieceResponse,
      error: null
    });

    // Appel de l'analyse
    const result = await outfitAnalysisAPI.analyzeImage(mockImageUri, mockUserId, 'clothing');

    // Vérifications
    expect(openaiService.analyzeOutfit).toHaveBeenCalledWith(mockImageUri, 'clothing');
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    
    // Vérifier que la catégorie est bien 'piece_unique'
    expect(result.data.category).toBe('piece_unique');
    
    // Vérifier que le type de pièce est spécifique
    expect(result.data.items[0].type).toBe('tshirt');
  });

  test('devrait gérer les différents types de vêtements', async () => {
    const clothingTypes = [
      'tshirt', 'shirt', 'sweater', 'pullover',
      'pants', 'jeans', 'shorts', 'skirt',
      'jacket', 'coat', 'dress', 'shoes', 'accessory'
    ];

    for (const clothingType of clothingTypes) {
      const mockResponse = {
        ...mockSinglePieceResponse,
        pieces: [{
          ...mockSinglePieceResponse.pieces[0],
          type: clothingType,
          name: `Test ${clothingType}`
        }]
      };

      openaiService.analyzeOutfit = jest.fn().mockResolvedValue({
        data: mockResponse,
        error: null
      });

      const result = await outfitAnalysisAPI.analyzeImage(mockImageUri, mockUserId, 'clothing');
      
      expect(result.data.category).toBe('piece_unique');
      expect(result.data.items[0].type).toBe(clothingType);
    }
  });

  test('devrait différencier une pièce unique d\'une tenue complète', async () => {
    // Test pièce unique
    openaiService.analyzeOutfit = jest.fn().mockResolvedValue({
      data: mockSinglePieceResponse,
      error: null
    });

    const singlePieceResult = await outfitAnalysisAPI.analyzeImage(mockImageUri, mockUserId, 'clothing');
    expect(singlePieceResult.data.category).toBe('piece_unique');

    // Test tenue complète
    const mockOutfitResponse = {
      ...mockSinglePieceResponse,
      type: 'outfit',
      category: 'quotidien',
      pieces: [
        { type: 'tshirt', name: 'T-shirt noir' },
        { type: 'jeans', name: 'Jean slim' },
        { type: 'shoes', name: 'Baskets blanches' }
      ]
    };

    openaiService.analyzeOutfit = jest.fn().mockResolvedValue({
      data: mockOutfitResponse,
      error: null
    });

    const outfitResult = await outfitAnalysisAPI.analyzeImage(mockImageUri, mockUserId, 'outfit');
    expect(outfitResult.data.category).not.toBe('piece_unique');
    expect(outfitResult.data.category).toBe('quotidien');
  });
});