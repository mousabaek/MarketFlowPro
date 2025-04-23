import React from 'react';
import GuidedTour from './guided-tour';
import { TooltipHeading, TooltipText, TooltipList, TooltipItem } from '@/contexts/tooltip-context';
import { TourStep, TourPosition } from './utils/tour-types';

const DashboardTour = () => {
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      element: '.dashboard-overview',
      title: 'Welcome to Wolf Auto Marketer!',
      content: (
        <div>
          <TooltipText>
            This is your central dashboard where you can monitor all your marketing activities
            and earnings. Let's take a quick tour to help you get started.
          </TooltipText>
        </div>
      ),
      position: 'bottom' as TourPosition
    },
    {
      id: 'earnings',
      element: '.earnings-overview',
      title: 'Track Your Earnings',
      content: (
        <div>
          <TooltipText>
            This section shows your current earnings, balance, and recent transactions.
            You can withdraw funds once you reach the $50 minimum threshold.
          </TooltipText>
        </div>
      ),
      position: 'bottom' as TourPosition
    },
    {
      id: 'workflows',
      element: '.active-workflows',
      title: 'Manage Your Workflows',
      content: (
        <div>
          <TooltipText>
            Workflows are automated marketing sequences that run on your connected platforms.
            Your active workflows are displayed here with their performance metrics.
          </TooltipText>
        </div>
      ),
      position: 'right' as TourPosition
    },
    {
      id: 'platforms',
      element: '.connected-platforms',
      title: 'Connected Platforms',
      content: (
        <div>
          <TooltipText>
            These are the marketing platforms you've connected to. Each platform can run
            multiple workflows to generate income automatically.
          </TooltipText>
          <TooltipList>
            <TooltipItem>Connect new platforms from the Connections page</TooltipItem>
            <TooltipItem>Monitor platform health and status</TooltipItem>
            <TooltipItem>Click on a platform to view detailed metrics</TooltipItem>
          </TooltipList>
        </div>
      ),
      position: 'left' as TourPosition
    },
    {
      id: 'activity',
      element: '.recent-activity',
      title: 'Recent Activity',
      content: (
        <div>
          <TooltipText>
            This feed shows recent updates from your active workflows and platforms,
            keeping you informed about important events and achievements.
          </TooltipText>
        </div>
      ),
      position: 'left' as TourPosition
    },
    {
      id: 'navigation',
      element: '.sidebar-navigation',
      title: 'Main Navigation',
      content: (
        <div>
          <TooltipText>
            Use the sidebar to navigate between different sections of the application:
          </TooltipText>
          <TooltipList>
            <TooltipItem>Dashboard: Main overview (you are here)</TooltipItem>
            <TooltipItem>Workflows: Create and manage marketing automations</TooltipItem>
            <TooltipItem>Connections: Link your marketing platform accounts</TooltipItem>
            <TooltipItem>Analytics: View detailed performance metrics</TooltipItem>
            <TooltipItem>Payments: Manage your earnings and withdrawals</TooltipItem>
          </TooltipList>
        </div>
      ),
      position: 'right' as TourPosition
    },
    {
      id: 'next-steps',
      element: '.create-workflow-button',
      title: 'Let\'s Get Started!',
      content: (
        <div>
          <TooltipText>
            To start generating income, create your first workflow by connecting
            a marketing platform and setting up automation steps.
          </TooltipText>
          <TooltipText>
            Click "Create Workflow" to begin, or explore other sections of the dashboard
            to learn more about the platform's features.
          </TooltipText>
        </div>
      ),
      position: 'bottom' as TourPosition
    }
  ];

  return (
    <GuidedTour
      tourId="dashboard-onboarding-tour"
      steps={tourSteps}
      onComplete={() => {
        console.log("Dashboard tour completed");
        // You could trigger additional actions here if needed
      }}
    />
  );
};

export default DashboardTour;