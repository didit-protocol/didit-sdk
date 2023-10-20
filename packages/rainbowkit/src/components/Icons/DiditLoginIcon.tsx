import React from 'react';
import { AsyncImage } from '../AsyncImage/AsyncImage';
import { loadImages } from '../AsyncImage/useAsyncImage';

const src = async () => (await import('./diditLogoIcon.svg')).default;

export const preloadLoginIcon = () => loadImages(src);

export const DiditLoginIcon = () => (
  <AsyncImage
    background="transparent"
    borderColor="actionButtonBorder"
    borderRadius="10"
    height="60"
    src={src}
    width="48"
  />
);
