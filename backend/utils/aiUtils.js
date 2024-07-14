const synaptic = require('synaptic');
const nlp = require('compromise');

// Initialize the synaptic network
const Layer = synaptic.Layer;
const Network = synaptic.Network;
const Trainer = synaptic.Trainer;

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
    const trainer = new Trainer(network);

    trainer.train(trainingData, {
        rate: 0.1,
        iterations: 20000,
        error: 0.005,
        shuffle: true,
        log: 1000,
        cost: Trainer.cost.MSE
    });
};

const prepareTrainingData = (executions) => {
    const trainingData = [];
    executions.forEach(execution => {
        const commonError = findCommonError(execution.data);
        const commonXPathFailure = findCommonXPathFailure(execution.data);
        const input = [commonError.length / 100, commonXPathFailure.length / 100];
        const output = [(execution.data.filter(test => test.status === 'failed').length / execution.data.length)];
        trainingData.push({ input, output });
    });
    return trainingData;
};

const analyzeResults = (executions) => {
    // Prepare and train the network with the dynamic execution data
    const trainingData = prepareTrainingData(executions);
    trainNetwork(trainingData);

    return executions.map(execution => {
        const totalTestCases = execution.data.length;
        const passed = execution.data.filter(test => test.status === 'passed').length;
        const failed = execution.data.filter(test => test.status === 'failed').length;

        const commonError = findCommonError(execution.data);
        const commonXPathFailure = findCommonXPathFailure(execution.data);
        const commonStepFailure = findCommonStepFailure(execution.data);
        const commonException = findCommonException(execution.data);
        const feedback = generateFeedback(commonError, commonXPathFailure, commonStepFailure, commonException);

        return {
            executionName: execution.name,
            totalTestCases,
            passed,
            failed,
            commonError,
            commonXPathFailure,
            commonStepFailure,
            commonException,
            feedback
        };
    });
};

const findCommonError = (data) => {
    const errorCounts = {};
    data.forEach(test => {
        if (test.steps) {
            test.steps.forEach(step => {
                if (step.result.status === 'failed') {
                    const errorMessage = step.result.error_message;
                    errorCounts[errorMessage] = (errorCounts[errorMessage] || 0) + 1;
                }
            });
        }
    });

    const sortedErrors = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]);
    return sortedErrors.length > 0 ? sortedErrors[0][0] : 'No common error';
};

const findCommonXPathFailure = (data) => {
    const xpathCounts = {};
    data.forEach(test => {
        if (test.steps) {
            test.steps.forEach(step => {
                if (step.result.status === 'failed' && step.result.error_message.includes('XPath')) {
                    const xpathError = step.result.error_message;
                    xpathCounts[xpathError] = (xpathCounts[xpathError] || 0) + 1;
                }
            });
        }
    });

    const sortedXPaths = Object.entries(xpathCounts).sort((a, b) => b[1] - a[1]);
    return sortedXPaths.length > 0 ? sortedXPaths[0][0] : 'No common XPath failure';
};

const findCommonStepFailure = (data) => {
    const stepCounts = {};
    data.forEach(test => {
        if (test.steps) {
            test.steps.forEach(step => {
                if (step.result.status === 'failed') {
                    const stepName = step.name || step.keyword;
                    stepCounts[stepName] = (stepCounts[stepName] || 0) + 1;
                }
            });
        }
    });

    const sortedSteps = Object.entries(stepCounts).sort((a, b) => b[1] - a[1]);
    return sortedSteps.length > 0 ? sortedSteps[0][0] : 'No common step failure';
};

const findCommonException = (data) => {
    const exceptionCounts = {};
    data.forEach(test => {
        if (test.steps) {
            test.steps.forEach(step => {
                if (step.result.status === 'failed' && step.result.error_message) {
                    const exception = parseException(step.result.error_message);
                    exceptionCounts[exception] = (exceptionCounts[exception] || 0) + 1;
                }
            });
        }
    });

    const sortedExceptions = Object.entries(exceptionCounts).sort((a, b) => b[1] - a[1]);
    return sortedExceptions.length > 0 ? sortedExceptions[0][0] : 'No common exception';
};

const parseException = (errorMessage) => {
    const seleniumExceptions = [
        'NoSuchElementException',
        'TimeoutException',
        'WebDriverException',
        'ElementNotVisibleException',
        // Add more Selenium exceptions as needed
    ];

    for (const exception of seleniumExceptions) {
        if (errorMessage.includes(exception)) {
            return exception;
        }
    }

    return 'UnknownException';
};

const generateFeedback = (commonError, commonXPathFailure, commonStepFailure, commonException) => {
    const input = [commonError.length / 100, commonXPathFailure.length / 100];
    const output = network.activate(input);
    const feedbackValue = output[0];

    let feedback = '';

    if (feedbackValue > 0.5) {
        feedback += 'There is a high likelihood of encountering errors related to common issues detected in the executions. ';
    } else {
        feedback += 'Errors related to common issues are unlikely to occur. ';
    }

    if (feedbackValue > 0.5) {
        feedback += 'There is a high likelihood of encountering XPath failures. ';
    } else {
        feedback += 'XPath failures are unlikely to occur. ';
    }

    if (commonStepFailure !== 'No common step failure') {
        feedback += `The most common step failure is "${commonStepFailure}". `;
    }

    if (commonException !== 'No common exception') {
        feedback += `The most common exception encountered is "${commonException}". `;
    }

    // Use nlp (compromise) to process feedback
    feedback = nlp(feedback).out('text');

    return feedback;
};

module.exports = { analyzeResults };
