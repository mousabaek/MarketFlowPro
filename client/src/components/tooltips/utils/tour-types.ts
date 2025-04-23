import { ReactNode } from 'react';

export type TourPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TourStep {
  id: string;
  element: string;
  title: string;
  content: ReactNode;
  position?: TourPosition;
}

export interface TourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
}