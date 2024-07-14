// src/utils/MathUtils.js
import { mean, median, mode, std } from 'mathjs';

export const calculateStatistics = (data) => {
  return {
    mean: mean(data),
    median: median(data),
    mode: mode(data),
    std: std(data),
  };
};
