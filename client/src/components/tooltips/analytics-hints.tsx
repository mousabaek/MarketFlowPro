import React from 'react';
import { ContextualTooltip } from '@/contexts/tooltip-context';
import { AnalyticsOverviewTooltip } from './predefined-tooltips';

/**
 * Component that adds contextual tooltips to various elements on the Analytics page
 */
const AnalyticsHints: React.FC = () => {
  return (
    <>
      {/* Main analytics dashboard overview tooltip */}
      <ContextualTooltip
        id="analytics-overview-tooltip"
        content={<AnalyticsOverviewTooltip />}
        side="bottom"
        highlight={true}
      >
        <div className="analytics-dashboard-hint-target hidden" />
      </ContextualTooltip>
      
      {/* Period selector tooltip */}
      <ContextualTooltip
        id="analytics-period-selector"
        content={
          <div>
            <h4 className="font-semibold text-sm mb-1">Select Time Period</h4>
            <p className="text-xs text-muted-foreground">
              Switch between different time periods to analyze your performance over specific timeframes.
              This affects all charts and metrics on the page.
            </p>
          </div>
        }
        side="top"
      >
        <div className="period-selector-hint-target hidden" />
      </ContextualTooltip>
      
      {/* Earnings chart tooltip */}
      <ContextualTooltip
        id="analytics-earnings-chart"
        content={
          <div>
            <h4 className="font-semibold text-sm mb-1">Earnings Visualization</h4>
            <p className="text-xs text-muted-foreground mb-2">
              This chart shows your earnings trend over time. Click on different metrics to change the view:
            </p>
            <ul className="list-disc text-xs ml-4 mb-2">
              <li className="mb-1">Total Earnings: Gross income before fees</li>
              <li className="mb-1">Platform Fees: 20% commission paid to the platform</li>
              <li className="mb-1">Net Earnings: Your actual income after fees</li>
              <li className="mb-1">Withdrawals: Money transferred to your account</li>
            </ul>
          </div>
        }
        side="right"
        delay={300}
      >
        <div className="earnings-chart-hint-target hidden" />
      </ContextualTooltip>
      
      {/* Platform performance tooltip */}
      <ContextualTooltip
        id="analytics-platform-performance"
        content={
          <div>
            <h4 className="font-semibold text-sm mb-1">Platform Performance</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Compare how your different connected platforms are performing:
            </p>
            <ul className="list-disc text-xs ml-4 mb-2">
              <li className="mb-1">Toggle between earnings and task metrics</li>
              <li className="mb-1">View success rates and active tasks</li>
              <li className="mb-1">Monitor platform health status</li>
            </ul>
          </div>
        }
        side="left"
      >
        <div className="platform-performance-hint-target hidden" />
      </ContextualTooltip>
      
      {/* Workflow performance tooltip */}
      <ContextualTooltip
        id="analytics-workflow-performance"
        content={
          <div>
            <h4 className="font-semibold text-sm mb-1">Workflow Metrics</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Track the success rate and revenue of your automated workflows:
            </p>
            <ul className="list-disc text-xs ml-4">
              <li className="mb-1">Switch between chart and table views</li>
              <li className="mb-1">Identify your highest-performing workflows</li>
              <li className="mb-1">Find opportunities for optimization</li>
            </ul>
          </div>
        }
        side="right"
      >
        <div className="workflow-performance-hint-target hidden" />
      </ContextualTooltip>
      
      {/* Admin analytics tooltip (only shown to admin users) */}
      <ContextualTooltip
        id="analytics-admin-reports"
        content={
          <div>
            <h4 className="font-semibold text-sm mb-1">Admin Analytics</h4>
            <p className="text-xs text-muted-foreground">
              As an admin, you have access to platform-wide metrics including user performance,
              commission breakdowns, and overall platform health. This information is only
              visible to administrators.
            </p>
          </div>
        }
        side="bottom"
      >
        <div className="admin-reports-hint-target hidden" />
      </ContextualTooltip>
    </>
  );
};

// Component to attach tooltip anchors to DOM elements after render
const AttachAnalyticsTooltips: React.FC = () => {
  React.useEffect(() => {
    // Function to find elements and attach tooltip targets
    const attachTooltipTargets = () => {
      // Analytics dashboard header
      const dashboardHeader = document.querySelector('h1');
      if (dashboardHeader) {
        const target = document.querySelector('.analytics-dashboard-hint-target');
        if (target) {
          target.classList.remove('hidden');
          dashboardHeader.appendChild(target);
        }
      }
      
      // Period selector
      const periodSelector = document.querySelector('select[value="period"]')?.closest('div');
      if (periodSelector) {
        const target = document.querySelector('.period-selector-hint-target');
        if (target) {
          target.classList.remove('hidden');
          periodSelector.appendChild(target);
        }
      }
      
      // Earnings chart
      const earningsChart = document.querySelector('.h-80');
      if (earningsChart) {
        const target = document.querySelector('.earnings-chart-hint-target');
        if (target) {
          target.classList.remove('hidden');
          earningsChart.appendChild(target);
        }
      }
      
      // Platform performance
      const platformPerformance = document.querySelector('div[class*="platform-performance"]');
      if (platformPerformance) {
        const target = document.querySelector('.platform-performance-hint-target');
        if (target) {
          target.classList.remove('hidden');
          platformPerformance.appendChild(target);
        }
      }
      
      // Workflow performance
      const workflowPerformance = document.querySelector('div[class*="workflow-performance"]');
      if (workflowPerformance) {
        const target = document.querySelector('.workflow-performance-hint-target');
        if (target) {
          target.classList.remove('hidden');
          workflowPerformance.appendChild(target);
        }
      }
      
      // Admin reports (for admin users only)
      const adminReports = document.querySelector('div[class*="admin-analytics"]');
      if (adminReports) {
        const target = document.querySelector('.admin-reports-hint-target');
        if (target) {
          target.classList.remove('hidden');
          adminReports.appendChild(target);
        }
      }
    };
    
    // Run once on initial render
    attachTooltipTargets();
    
    // Also set up a mutation observer to handle dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-check for elements when new content is added
          setTimeout(attachTooltipTargets, 500);
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);
  
  return null;
};

// Export both components for flexibility
export { AnalyticsHints, AttachAnalyticsTooltips };

// Default export combines both components
const AnalyticsTooltipProvider: React.FC = () => (
  <>
    <AnalyticsHints />
    <AttachAnalyticsTooltips />
  </>
);

export default AnalyticsTooltipProvider;