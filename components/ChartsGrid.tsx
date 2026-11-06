import React from 'react';
import { CHART_GROUPS } from '../config/sensors';
import { ProcessedSample } from '../types/sensor';
import { SensorChart } from './SensorChart';

interface ChartsGridProps {
  samples: ProcessedSample[];
  timeWindowSec: number;
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({
  samples,
  timeWindowSec,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {CHART_GROUPS.map((group) => (
        <SensorChart
          key={group.id}
          config={group}
          samples={samples}
          timeWindowSec={timeWindowSec}
        />
      ))}
    </div>
  );
};
