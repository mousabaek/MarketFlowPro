import React from 'react';
import { TooltipHeading, TooltipText, TooltipList, TooltipItem } from '@/contexts/tooltip-context';
import { ExternalLink } from 'lucide-react';

// Dashboard tooltips
export const DashboardOverviewTooltip = () => (
  <div>
    <TooltipHeading>Welcome to Your Dashboard</TooltipHeading>
    <TooltipText>
      This is your central command center for all platform activities and metrics.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Monitor earnings and performance</TooltipItem>
      <TooltipItem>Manage active workflows</TooltipItem>
      <TooltipItem>View recent platform activities</TooltipItem>
    </TooltipList>
    <TooltipText>
      Click on any card to access more detailed information or controls.
    </TooltipText>
  </div>
);

// Workflow tooltips
export const WorkflowCreationTooltip = () => (
  <div>
    <TooltipHeading>Creating Your First Workflow</TooltipHeading>
    <TooltipText>
      Workflows automate your marketing tasks across different platforms.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Select a platform to connect</TooltipItem>
      <TooltipItem>Define steps and triggers</TooltipItem>
      <TooltipItem>Set performance goals</TooltipItem>
    </TooltipList>
    <TooltipText>
      Start with a template or create a custom workflow from scratch.
    </TooltipText>
  </div>
);

// Payment tooltips
export const WithdrawalProcessTooltip = () => (
  <div>
    <TooltipHeading>Withdrawing Your Earnings</TooltipHeading>
    <TooltipText>
      You can transfer your earnings to your bank account once you reach the minimum threshold of $50.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Withdrawals are processed within 24 hours</TooltipItem>
      <TooltipItem>Verification code will be sent to your email</TooltipItem>
      <TooltipItem>Multiple payment methods available</TooltipItem>
    </TooltipList>
    <TooltipText>
      Make sure your payment information is up-to-date in your settings.
    </TooltipText>
  </div>
);

// Platform connection tooltips
export const PlatformConnectionTooltip = () => (
  <div>
    <TooltipHeading>Connecting to Marketing Platforms</TooltipHeading>
    <TooltipText>
      Wolf Auto Marketer connects with major marketing platforms to automate your tasks.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Authorize with your platform credentials</TooltipItem>
      <TooltipItem>Allow necessary permissions</TooltipItem>
      <TooltipItem>Test connection before proceeding</TooltipItem>
    </TooltipList>
    <TooltipText>
      Your credentials are securely stored and encrypted.
    </TooltipText>
  </div>
);

// Analytics tooltips
export const AnalyticsOverviewTooltip = () => (
  <div>
    <TooltipHeading>Understanding Your Analytics</TooltipHeading>
    <TooltipText>
      The analytics dashboard provides insights into your performance and earnings.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Switch between different time periods</TooltipItem>
      <TooltipItem>Click on charts to see detailed data</TooltipItem>
      <TooltipItem>Export reports for your records</TooltipItem>
    </TooltipList>
    <TooltipText>
      Regular analysis helps optimize your marketing strategies.
    </TooltipText>
  </div>
);

// AI features tooltips
export const AIFeaturesOverviewTooltip = () => (
  <div>
    <TooltipHeading>AI-Powered Marketing Tools</TooltipHeading>
    <TooltipText>
      Our AI tools help you create content and identify opportunities faster.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Generate professional marketing content with one click</TooltipItem>
      <TooltipItem>Analyze market trends automatically</TooltipItem>
      <TooltipItem>Optimize your workflows with AI recommendations</TooltipItem>
    </TooltipList>
    <div className="flex items-center gap-1 text-xs text-primary mt-2">
      <ExternalLink size={12} />
      <a href="#" className="hover:underline">Learn more about our AI features</a>
    </div>
  </div>
);

// Subscription tooltips
export const SubscriptionFeaturesTooltip = () => (
  <div>
    <TooltipHeading>Your Subscription Benefits</TooltipHeading>
    <TooltipText>
      Wolf Auto Marketer offers different subscription tiers with various benefits.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Free 3-day trial to test all features</TooltipItem>
      <TooltipItem>Monthly ($39.99) or annual ($399.90) plans</TooltipItem>
      <TooltipItem>Premium plan ($75) for additional features</TooltipItem>
    </TooltipList>
    <TooltipText>
      You can upgrade or downgrade your subscription at any time.
    </TooltipText>
  </div>
);

// General guidance tooltips
export const NavigationHelpTooltip = () => (
  <div>
    <TooltipHeading>Navigating Wolf Auto Marketer</TooltipHeading>
    <TooltipText>
      Use the sidebar menu to access different sections of the application.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Dashboard: Overview of all activities</TooltipItem>
      <TooltipItem>Workflows: Create and manage automations</TooltipItem>
      <TooltipItem>Analytics: Track performance metrics</TooltipItem>
      <TooltipItem>Settings: Customize your experience</TooltipItem>
    </TooltipList>
  </div>
);

// Settings tooltips
export const SettingsOverviewTooltip = () => (
  <div>
    <TooltipHeading>Customizing Your Settings</TooltipHeading>
    <TooltipText>
      Manage your account, security, and application preferences here.
    </TooltipText>
    <TooltipList>
      <TooltipItem>Update profile and contact information</TooltipItem>
      <TooltipItem>Change password and security settings</TooltipItem>
      <TooltipItem>Manage notification preferences</TooltipItem>
      <TooltipItem>Configure platform appearance and behavior</TooltipItem>
    </TooltipList>
  </div>
);