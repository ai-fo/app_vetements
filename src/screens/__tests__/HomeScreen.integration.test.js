import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import HomeScreen from '../HomeScreen';
import { useAuth } from '../../features/auth';
import { useOutfitAnalysis } from '../../features/outfit-analysis';

// Mock des dépendances
jest.mock('expo-image-picker');
jest.mock('../../features/auth');
jest.mock('../../features/outfit-analysis');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));
jest.spyOn(Alert, 'alert');

describe('HomeScreen - Quick Gallery Add Integration', () => {
  const mockUser = { id: 'user123' };
  const mockAnalyzeOutfit = jest.fn();
  const mockGetUserAnalyses = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ 
      user: mockUser,
      signOut: jest.fn() 
    });
    useOutfitAnalysis.mockReturnValue({ 
      analyzeOutfit: mockAnalyzeOutfit,
      getUserAnalyses: mockGetUserAnalyses,
      analyses: []
    });
  });

  const renderHomeScreen = () => {
    return render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
  };

  it('should have quick add button for clothing', () => {
    const { getByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    expect(addButton).toBeTruthy();
  });

  it('should open gallery directly when add clothing button is pressed', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true
    });

    const { getByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    fireEvent.press(addButton.parent.parent);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
    });
  });

  it('should analyze clothing when image is selected', async () => {
    const mockImageUri = 'file://test-clothing.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    mockAnalyzeOutfit.mockResolvedValue({ success: true });

    const { getByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    fireEvent.press(addButton.parent.parent);

    await waitFor(() => {
      expect(mockAnalyzeOutfit).toHaveBeenCalledWith(
        mockImageUri,
        mockUser.id,
        'clothing'
      );
    });
  });

  it('should show processing overlay during analysis', async () => {
    const mockImageUri = 'file://test-clothing.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    
    // Simuler un délai pour vérifier l'overlay
    mockAnalyzeOutfit.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText, queryByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    fireEvent.press(addButton.parent.parent);

    await waitFor(() => {
      expect(queryByText('Ajout à votre garde-robe...')).toBeTruthy();
    });
  });

  it('should have separate camera button for outfit analysis', () => {
    const { getAllByTestId } = renderHomeScreen();
    
    // Vérifier qu'il y a un bouton caméra distinct
    const floatingButtons = getAllByTestId(/floating-button/);
    expect(floatingButtons.length).toBeGreaterThan(1);
  });

  it('should handle permission denied gracefully', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'denied'
    });

    const { getByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    fireEvent.press(addButton.parent.parent);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission refusée',
        'Nous avons besoin de votre permission pour accéder à la galerie.'
      );
    });
  });

  it('should handle analysis errors gracefully', async () => {
    const mockImageUri = 'file://test-clothing.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    mockAnalyzeOutfit.mockRejectedValue(new Error('Analysis failed'));

    const { getByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    fireEvent.press(addButton.parent.parent);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        "L'ajout du vêtement a échoué. Veuillez réessayer."
      );
    });
  });

  it('should disable button during processing', async () => {
    const mockImageUri = 'file://test-clothing.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    
    mockAnalyzeOutfit.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText } = renderHomeScreen();
    
    const addButton = getByText('Ajouter un vêtement');
    const touchable = addButton.parent.parent;
    
    fireEvent.press(touchable);

    await waitFor(() => {
      expect(touchable.props.disabled).toBe(true);
    });
  });
});