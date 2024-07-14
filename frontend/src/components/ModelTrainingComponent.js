import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const ModelTrainingComponent = () => {
  const [data, setData] = useState([]);
  const modelRef = useRef(null);
  const isTrainingRef = useRef(false);

  useEffect(() => {
    // Initialize the model only once
    if (!modelRef.current) {
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
      model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
      modelRef.current = model;
    }
  }, []);

  const trainModel = async () => {
    if (isTrainingRef.current) {
      console.log("Training is already in progress...");
      return;
    }

    isTrainingRef.current = true;

    const xs = tf.tensor2d(data.map(d => [d.x]));
    const ys = tf.tensor2d(data.map(d => [d.y]));

    try {
      await modelRef.current.fit(xs, ys, {
        epochs: 10,
        callbacks: {
          onTrainEnd: () => {
            isTrainingRef.current = false;
          }
        }
      });
    } catch (error) {
      console.error("Error during training: ", error);
      isTrainingRef.current = false;
    }
  };

  const predictNextValue = async () => {
    if (isTrainingRef.current) {
      console.log("Training is already in progress. Please wait...");
      return null;
    }

    await trainModel();

    const nextValue = modelRef.current.predict(tf.tensor2d([[data.length]]));
    return nextValue.dataSync()[0];
  };

  const handlePredict = async () => {
    const prediction = await predictNextValue();
    if (prediction !== null) {
      console.log("Next predicted value: ", prediction);
    }
  };

  return (
    <div>
      <button onClick={handlePredict}>Predict Next Value</button>
    </div>
  );
};

export default ModelTrainingComponent;
