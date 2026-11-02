import React from 'react';

interface OrientationLockOverlayProps {
  onUnlockAttempt?: () => void;
}

/**
 * All mobile layouts (Portrait, Landscape, Flip Cover Screen, Flip Flex Mode,
 * Foldable Narrow Outer & Unfolded Inner, Tablets, and Desktops) are natively supported.
 */
export const OrientationLockOverlay: React.FC<OrientationLockOverlayProps> = () => {
  return null;
};
