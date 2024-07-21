const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { analyzeResults } = require('../utils/aiUtils'); // Import the AI utility

// Function to extract data from the JSON file
const getReportData = (jsonFilePath) => {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    return data;
};

// Function to compute and print statistics
const computeStats = (reportsDir) => {
    const files = fs.readdirSync(reportsDir);
    console.log(`Number of execution data files: ${files.length}`);

    files.forEach(file => {
        const filePath = path.join(reportsDir, file);
        const data = getReportData(filePath);

        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let totalSteps = 0;
        let passedSteps = 0;
        let failedSteps = 0;

        console.log(`\nProcessing file: ${file}`);

        // Check if data is an array and process accordingly
        if (Array.isArray(data)) {
            data.forEach((feature) => {
                const stats = processFeature(feature);
                totalScenarios += stats.totalScenarios;
                passedScenarios += stats.passedScenarios;
                failedScenarios += stats.failedScenarios;
                totalSteps += stats.totalSteps;
                passedSteps += stats.passedSteps;
                failedSteps += stats.failedSteps;
            });
        } else {
            const stats = processFeature(data);
            totalScenarios += stats.totalScenarios;
            passedScenarios += stats.passedScenarios;
            failedScenarios += stats.failedScenarios;
            totalSteps += stats.totalSteps;
            passedSteps += stats.passedSteps;
            failedSteps += stats.failedSteps;
        }

        console.log(`\nSummary for file: ${file}`);
        console.log(`  Total Scenarios: ${totalScenarios}`);
        console.log(`  Passed Scenarios: ${passedScenarios}`);
        console.log(`  Failed Scenarios: ${failedScenarios}`);
        console.log(`  Total Steps: ${totalSteps}`);
        console.log(`  Passed Steps: ${passedSteps}`);
        console.log(`  Failed Steps: ${failedSteps}`);
    });
};

// Function to process a feature and accumulate statistics
const processFeature = (feature) => {
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let totalSteps = 0;
    let passedSteps = 0;
    let failedSteps = 0;

    if (feature.elements) {
        feature.elements.forEach((scenario) => {
            totalScenarios++;
            if (scenario.steps && scenario.steps.every(step => step.result.status === 'passed')) {
                passedScenarios++;
            } else {
                failedScenarios++;
            }

            console.log(`  Scenario: ${scenario.name} - ${scenario.steps && scenario.steps.every(step => step.result.status === 'passed') ? 'Passed' : 'Failed'}`);

            scenario.steps && scenario.steps.forEach((step) => {
                totalSteps++;
                if (step.result.status === 'passed') {
                    passedSteps++;
                } else {
                    failedSteps++;
                }

                console.log(`    Step: ${step.name} - ${step.result.status}`);
            });
        });
    }

    return {
        totalScenarios,
        passedScenarios,
        failedScenarios,
        totalSteps,
        passedSteps,
        failedSteps
    };
};

// Endpoint to get all reports and print stats
// router.get('/', (req, res) => {
//     const reportsDir = path.join(__dirname, '../../common/cucumber-reports');
//     try {
//         computeStats(reportsDir);
//         const files = fs.readdirSync(reportsDir);
//         const reports = files.map(file => {
//             const filePath = path.join(reportsDir, file);
//             const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//             return {
//                 name: file,
//                 data: report
//             };
//         });
//         res.json(reports);
//     } catch (err) {
//         console.error('Error processing reports:', err.message);
//         res.status(500).json({ error: err.message });
//     }
// });

const findReportFiles = (dir) => {
    let results = [];
    
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        results = results.concat(findReportFiles(filePath));
      } else if (file === 'report.json') {
        results.push(filePath);
      }
    });
    
    return results;
  };

  const readReportFiles = (filePaths) => {
    return filePaths.map((filePath) => {
      const data = fs.readFileSync(filePath, 'utf8');
      let arr = filePath.split("\\");
      let executionFolderName=arr[arr.length-2];
      const testCase = JSON.parse(data);

      return {
        name:executionFolderName,
        data:JSON.parse(data)
      };
    });
  };

  
router.get('/', (req, res) => {
    const reportsDir = path.join(__dirname, '../../common/cucumber-reports/');
    try {
        const reportFiles = findReportFiles(reportsDir);
        const reports = readReportFiles(reportFiles);

        res.json(reports);
    } catch (err) {
        console.error('Error processing reports:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to get a specific report by name
router.get('/:name', (req, res) => {
    const reportName = req.params.name;
    const reportsDir = path.join(__dirname, '../../common/cucumber-reports');
    const filePath = path.join(reportsDir, reportName);
    try {
        if (fs.existsSync(filePath)) {
            const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            res.json(report);
        } else {
            res.status(404).json({ error: 'Report not found' });
        }
    } catch (err) {
        console.error('Error fetching report:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const toBase64 = (filePath) => {
    const file = fs.readFileSync(filePath);
    return `data:image/png;base64,${file.toString('base64')}`;
};

router.get('/image/getCode/:foldername/:filename', (req, res) => {
    console.log("IMAGE API",req.params.foldername,req.params.filename)
    const imagePath = path.join(__dirname, `../../common/cucumber-reports/${req.params.foldername}/screenshots`, req.params.filename);
  
    if (fs.existsSync(imagePath)) {
      const base64Image = toBase64(imagePath);
      res.json({ base64Image });
    } else {
      res.status(404).send('Image not found');
    }
});

router.get('/logs/downloadFile/:foldername', (req, res) => {
    console.log('logs',req.params.foldername)
    const filePath = path.join(__dirname, `../../common/cucumber-reports/${req.params.foldername}`, 'logs.txt');
  
    res.download(filePath, 'logs.txt', (err) => {
      if (err) {
        res.status(500).send('Error downloading file',err);
      }
    });
  });

// New endpoint to analyze selected reports
router.post('/analyze', (req, res) => {
    const selectedExecutions = req.body.executions;
    if (!selectedExecutions || !Array.isArray(selectedExecutions)) {
        return res.status(400).json({ error: 'Invalid input data' });
    }
    const results = analyzeResults(selectedExecutions);
    res.json(results);
});

module.exports = router;
