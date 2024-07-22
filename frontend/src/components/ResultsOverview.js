import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ResultsOverview = ({ reports }) => {
  const projectData = {};

  reports.forEach(report => {
    const projectName = report.name.split('_')[0] + '_' + report.name.split('_')[1];
    if (!projectData[projectName]) {
      projectData[projectName] = { passed: 0, failed: 0 };
    }

    const passed = report.data.reduce((acc, feature) => acc + feature.elements.filter(e => e.steps.every(s => s.result.status === 'passed')).length, 0);
    const failed = report.data.reduce((acc, feature) => acc + feature.elements.filter(e => e.steps.some(s => s.result.status === 'failed')).length, 0);

    projectData[projectName].passed += passed;
    projectData[projectName].failed += failed;
  });

  const projectNames = Object.keys(projectData);
  const passedData = projectNames.map(name => projectData[name].passed);
  const failedData = projectNames.map(name => projectData[name].failed);

  const pieData = {
    labels: projectNames,
    datasets: [{
      data: passedData,
      backgroundColor: ['#4CAF50', '#FF0000'],
      borderColor: '#000',
      borderWidth: 1
    }],
  };

  const barData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Passed',
        data: passedData,
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Failed',
        data: failedData,
        backgroundColor: '#FF0000',
      }
    ]
  };

  return (
    <div className="results-overview">
      <h2>Results Overview</h2>
      <div className="charts-container">
        <div className="pie-chart-container">
          <h3>Pie Chart</h3>
          <Pie data={pieData} />
        </div>
        <div className="bar-chart-container">
          <h3>Bar Chart</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default ResultsOverview;
