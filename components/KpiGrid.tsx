import React from 'react';
import { KPI_CARDS } from '../config/sensors';
import { ProcessedSample } from '../types/sensor';
import { KpiCard } from './KpiCard';

interface KpiGridProps {
  latestSample: ProcessedSample | null;
  history: ProcessedSample[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ latestSample, history }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {KPI_CARDS.map((config) => {
        const val = latestSample ? (latestSample[config.key] as number) : undefined;
        return <KpiCard key={config.id} config={config} value={val} history={history} />;
      })}
    </div>
  );
};
