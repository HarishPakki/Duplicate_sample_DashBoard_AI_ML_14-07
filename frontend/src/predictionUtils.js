import * as tf from '@tensorflow/tfjs';

let isTraining = false; // Flag to indicate if the model is currently training

const trainModel = async (model, xs, ys) => {
    if (isTraining) {
        console.log('Training is already in progress.');
        return;
    }
    
    isTraining = true; // Set the flag to true to indicate training has started

    await model.fit(xs, ys, {
        epochs: 10,
        callbacks: {
            onTrainEnd: () => {
                isTraining = false; // Reset the flag when training ends
            }
        }
    });
};

export const getPrediction = async (data) => {
    const xs = tf.tensor2d(data.map((val, i) => [i]), [data.length, 1]);
    const ys = tf.tensor2d(data, [data.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    await trainModel(model, xs, ys); // Train the model

    const prediction = model.predict(tf.tensor2d([[data.length]], [1, 1]));
    return prediction.dataSync()[0];
};
