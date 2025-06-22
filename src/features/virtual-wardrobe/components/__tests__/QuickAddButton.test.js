import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import QuickAddButton from '../QuickAddButton';
import { useAuth } from '../../../auth';
import { useOutfitAnalysis } from '../../../outfit-analysis';

// Mock des dépendances
jest.mock('expo-image-picker');
jest.mock('../../../auth');
jest.mock('../../../outfit-analysis');
jest.spyOn(Alert, 'alert');

describe('QuickAddButton', () => {
  const mockUser = { id: 'user123' };
  const mockAnalyzeOutfit = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    useOutfitAnalysis.mockReturnValue({ analyzeOutfit: mockAnalyzeOutfit });
  });

  it('should render correctly', () => {
    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );
    
    expect(getByTestId('quick-add-button')).toBeTruthy();
  });

  it('should request gallery permission when pressed', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true
    });

    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    fireEvent.press(getByTestId('quick-add-button'));

    await waitFor(() => {
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('should show alert when permission is denied', async () => {
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'denied'
    });

    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    fireEvent.press(getByTestId('quick-add-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission refusée',
        'Nous avons besoin de votre permission pour accéder à la galerie.'
      );
    });
  });

  it('should analyze image when selected from gallery', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    mockAnalyzeOutfit.mockResolvedValue({ success: true });

    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    fireEvent.press(getByTestId('quick-add-button'));

    await waitFor(() => {
      expect(mockAnalyzeOutfit).toHaveBeenCalledWith(
        mockImageUri,
        mockUser.id,
        'clothing'
      );
    });
  });

  it('should call onSuccess callback after successful analysis', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    mockAnalyzeOutfit.mockResolvedValue({ success: true });

    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    fireEvent.press(getByTestId('quick-add-button'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should show error alert when analysis fails', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    mockAnalyzeOutfit.mockRejectedValue(new Error('Analysis failed'));

    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    fireEvent.press(getByTestId('quick-add-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        "L'ajout du vêtement a échoué. Veuillez réessayer."
      );
    });
  });

  it('should show loading indicator during processing', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted'
    });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri }]
    });
    
    // Simuler un délai pour vérifier l'indicateur de chargement
    mockAnalyzeOutfit.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByTestId, queryByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    fireEvent.press(getByTestId('quick-add-button'));

    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeTruthy();
    });
  });

  it('should be disabled while processing', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
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

    const { getByTestId } = render(
      <QuickAddButton onSuccess={mockOnSuccess} />
    );

    const button = getByTestId('quick-add-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });
});