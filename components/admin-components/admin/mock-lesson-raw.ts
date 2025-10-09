export const mockLessonRawContent = `---
title: Introduction to Supervised Learning
slug: introduction-to-sl
---

## What is Supervised Learning?

In supervised learning, we are given a data set and already know what our correct output should look like, having the idea that there is a relationship between the input and the output.

Supervised learning problems are categorized into "regression" and "classification" problems.

---
type: code
language: python
initialCode: |
  # Simple linear regression example data
  import numpy as np
  
  # Feature (e.g., size of a house)
  X = np.array([1, 2, 3, 4, 5])
  
  # Target (e.g., price of a house)
  y = np.array([2, 4, 5, 4, 5])
  
  print("Data is ready for training a model!")
---
type: quiz
question: Which of the following is a classification task?
options: ['Predicting the price of a house.', 'Identifying spam emails.', 'Grouping customers based on purchase history.']
correctAnswer: 1
---

That concludes our introduction to Supervised Learning! In the next lesson, we will dive deeper into Linear Regression.
`;
