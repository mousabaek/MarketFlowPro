import React from 'react';
import { Platform } from '@shared/schema';
import { FreelancerPlatform } from './freelancer-platform';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface PlatformFactoryProps {
  platform: Platform;
}

export function PlatformFactory({ platform }: PlatformFactoryProps) {
  // Return appropriate platform component based on platform type and name
  switch (platform.name) {
    case 'Freelancer':
      return <FreelancerPlatform platform={platform} />;
    
    // Add cases for other platforms like Upwork, Fiverr, Clickbank, etc.
    
    default:
      // Generic platform display for unsupported or unknown platforms
      return (
        <Card>
          <CardHeader>
            <CardTitle>{platform.name}</CardTitle>
            <CardDescription>
              {platform.type.charAt(0).toUpperCase() + platform.type.slice(1)} Platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unsupported Platform</AlertTitle>
              <AlertDescription>
                The platform '{platform.name}' is not fully supported yet. Some features may be limited or unavailable.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
  }
}