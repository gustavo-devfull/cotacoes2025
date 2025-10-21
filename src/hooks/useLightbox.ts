import { useState } from 'react';

interface UseLightboxReturn {
  isOpen: boolean;
  currentIndex: number;
  images: string[];
  title?: string;
  openLightbox: (images: string[], index?: number, title?: string) => void;
  closeLightbox: () => void;
  navigateTo: (index: number) => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useLightbox = (): UseLightboxReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string | undefined>();

  const openLightbox = (newImages: string[], index: number = 0, newTitle?: string) => {
    if (newImages.length === 0) return;
    
    setImages(newImages);
    setCurrentIndex(Math.max(0, Math.min(index, newImages.length - 1)));
    setTitle(newTitle);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setImages([]);
    setCurrentIndex(0);
    setTitle(undefined);
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const nextImage = () => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(prevIndex);
  };

  return {
    isOpen,
    currentIndex,
    images,
    title,
    openLightbox,
    closeLightbox,
    navigateTo,
    nextImage,
    prevImage
  };
};





















