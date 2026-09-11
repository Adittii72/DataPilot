import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import OverviewView from './OverviewView';
import DataQualityView from './DataQualityView';
import StatisticsView from './StatisticsView';
import EdaView from './EdaView';
import VisualizationSection from '../components/VisualizationSection';
import SettingsModal from '../components/SettingsModal';
import HelpModal from '../components/HelpModal';

export default function Dashboard({
  analysis,
  filename,
  insights,
  onNewDataset,
  onRefreshAnalysis,
  isAnalyzing,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const shape = analysis?.profile?.shape;

  return (
    <div className="dashboard-frame">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        filename={filename}
      />

      <div className="dashboard-main-area">
        <Topbar
          filename={filename}
          shape={shape}
          onNewDataset={onNewDataset}
          onRefreshAnalysis={onRefreshAnalysis}
          isAnalyzing={isAnalyzing}
        />

        <main className="dashboard-content-scroll">
          {activeTab === 'overview' && (
            <OverviewView analysis={analysis} insights={insights} />
          )}

          {activeTab === 'visualize' && (
            <VisualizationSection analysis={analysis} filename={filename} />
          )}

          {activeTab === 'quality' && (
            <DataQualityView analysis={analysis} />
          )}

          {activeTab === 'statistics' && (
            <StatisticsView analysis={analysis} />
          )}

          {activeTab === 'eda' && (
            <EdaView analysis={analysis} />
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}