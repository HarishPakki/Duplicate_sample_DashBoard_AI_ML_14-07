const synaptic = require('synaptic');
// const nlp = require('compromise'); // Comment out this line for now

// Initialize the synaptic network
const { Layer, Network } = synaptic;
const inputLayer = new Layer(2);
const hiddenLayer = new Layer(3);
const outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const network = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

const trainNetwork = (trainingData) => {
    const trainer = new synaptic.Trainer(network);

    trainer.train(trainingData, {
        rate: 0.1,
        iterations: 20000,
        error: 0.005,
        shuffle: true,
        log: 1000,
        cost: synaptic.Trainer.cost.MSE
    });
};

const prepareTrainingData = (executions) => {
    const trainingData = [];
    executions.forEach(execution => {
        const commonError = findCommonError(execution.elements || []);
        const commonXPathFailure = findCommonXPathFailure(execution.elements || []);
        const input = [commonError.length / 100, commonXPathFailure.length / 100];
        const output = [(execution.elements?.filter(test => test.steps?.some(step => step.result?.status === 'failed')).length || 0) / (execution.elements?.length || 1)];
        trainingData.push({ input, output });
    });
    return trainingData;
};

const analyzeResults = (executions) => {
    // Prepare and train the network with the dynamic execution data
    const trainingData = prepareTrainingData(executions);
    // trainNetwork(trainingData); // Comment out for now

    const analysisResults = executions.map(execution => {
        const totalTestCases = execution.elements?.length || 0;
        const passed = execution.elements?.filter(test => test.steps?.every(step => step.result?.status === 'passed')).length || 0;
        const failed = execution.elements?.filter(test => test.steps?.some(step => step.result?.status === 'failed')).length || 0;

        const commonError = findCommonError(execution.elements || []);
        const commonXPathFailure = findCommonXPathFailure(execution.elements || []);
        // const feedback = generateFeedback(commonError, commonXPathFailure); // Comment out for now

        return {
            executionName: execution.name,
            totalTestCases,
            passed,
            failed,
            commonError,
            commonXPathFailure,
            // feedback // Comment out for now
        };
    });

    console.log("Selected Executions:", executions);
    analysisResults.forEach(result => {
        console.log(`Execution: ${result.executionName}`);
        console.log(`Total Test Cases: ${result.totalTestCases}`);
        console.log(`Passed: ${result.passed}`);
        console.log(`Failed: ${result.failed}`);
        console.log(`Most Frequent Error: ${result.commonError}`);
        console.log(`Most Frequent Error Step: ${result.commonXPathFailure}`);
        // console.log(`Feedback: ${result.feedback}`); // Comment out for now
    });

    return analysisResults;
};

const findCommonError = (elements) => {
    const errorCounts = {};
    elements.forEach(test => {
        if (test.steps) {
            test.steps.forEach(step => {
                if (step.result?.status === 'failed') {
                    const errorMessage = step.result.error_message;
                    if (errorMessage) {
                        errorCounts[errorMessage] = (errorCounts[errorMessage] || 0) + 1;
                    }
                }
            });
        }
    });

    const sortedErrors = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
    return sortedErrors.length > 0 ? sortedErrors[0][0] : 'No common error';
};

const findCommonXPathFailure = (elements) => {
    const xpathCounts = {};
    elements.forEach(test => {
        if (test.steps) {
            test.steps.forEach(step => {
                if (step.result?.status === 'failed' && step.result.error_message?.includes('XPath')) {
                    const xpathError = step.result.error_message;
                    if (xpathError) {
                        xpathCounts[xpathError] = (xpathCounts[xpathError] || 0) + 1;
                    }
                }
            });
        }
    });

    const sortedXPaths = Object.entries(xpathCounts).sort((a, b) => b[1] - a[1]);
    return sortedXPaths.length > 0 ? sortedXPaths[0][0] : 'No common XPath failure';
};

// const generateFeedback = (commonError, commonXPathFailure) => {
//     const input = [commonError.length / 100, commonXPathFailure.length / 100];
//     const output = network.activate(input);
//     const feedbackValue = output[0];

//     let feedback = '';

//     if (feedbackValue > 0.5) {
//         feedback += 'There is a high likelihood of encountering errors related to common issues detected in the executions. ';
//     } else {
//         feedback += 'Errors related to common issues are unlikely to occur. ';
//     }

//     if (feedbackValue > 0.5) {
//         feedback += 'There is a high likelihood of encountering XPath failures. ';
//     } else {
//         feedback += 'XPath failures are unlikely to occur. ';
//     }

//     feedback = nlp(feedback).out('text');

//     return feedback;
// };

module.exports = { analyzeResults };
