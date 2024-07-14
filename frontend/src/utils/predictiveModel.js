// // src/utils/predictiveModel.js

// import * as tf from '@tensorflow/tfjs';

// // Generate a simple linear dataset
// const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
// const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

// // Create a simple sequential model
// const model = tf.sequential();
// model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

// // Compile the model
// model.compile({
//   optimizer: 'sgd',
//   loss: 'meanSquaredError'
// });

// // Train the model
// async function trainModel() {
//   await model.fit(xs, ys, {
//     epochs: 100
//   });
// }

// // Predict the next value
// async function predictNextValue(input) {
//   await trainModel();
//   const output = model.predict(tf.tensor2d([input], [1, 1]));
//   return output.dataSync()[0];
// }

// export { predictNextValue };
