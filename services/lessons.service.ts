import { Lesson } from '../types/lessons';

const DECISION_TREES_LESSON_DATA: Lesson = {
  id: 'l1-decision-trees',
  slug: 'decision-trees',
  title: "Lesson 6: Decision Trees",
  breadcrumbs: [
      { title: "Classic ML Algorithms", href: "#/dashboard/course?slug=classic-ml-algorithms" }
  ],
  cells: [
    {
      id: 'introduction',
      type: 'text',
      title: "Introduction",
      content: "**Welcome to the lesson** on Decision Trees! This powerful and intuitive algorithm is a fundamental building block in machine learning. It's used for both classification and regression tasks, making it incredibly versatile. Unlike 'black box' models, decision trees are easy to interpret, which is why they're often called 'white box' models."
    },
    {
      id: 'intuition',
      type: 'text',
      title: "Tree Intuition",
      content: "Imagine you're trying to decide whether to play tennis. You might ask a series of questions: Is the weather sunny? Is the wind strong? Based on the answers, you make a decision. A decision tree works in the same way. It's a flowchart-like structure where:\n\n*   Each internal node represents a \"test\" on an attribute (e.g., whether a coin flip is heads or tails).\n*   Each branch represents the outcome of the test.\n*   Each leaf node represents a class label (the decision taken after computing all attributes)."
    },
    {
      id: 'practice',
      type: 'text',
      title: "Scikit-learn Practice",
      content: "Now, let's get our hands dirty with some code. We'll use the popular Iris dataset to build a simple decision tree classifier using Scikit-learn. First, we need to import the necessary libraries and load the data."
    },
    {
        id: 'cell-code-1',
        type: 'code',
        initialCode: `from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

# Load the data
iris = load_iris()
X = iris.data
y = iris.target

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)`
    },
    {
        id: 'challenge',
        type: 'challenge',
        title: "Your Turn: Train the Model",
        instructions: "Next, we create an instance of the `DecisionTreeClassifier` and fit it to our training data. Try it yourself in the editor below. Set `max_depth` to 2 and `random_state` to 42.",
        initialCode: `# Create and train the model
clf = DecisionTreeClassifier(max_depth=2, random_state=42)
clf.fit(X_train, y_train)

# Make a prediction
print("Prediction for a new flower:", clf.predict([[5.1, 3.5, 1.4, 0.2]]))`,
        validationCode: "" // Stub
    },
    {
      id: 'test',
      type: 'text',
      title: "Test Yourself",
      content: "To solidify your understanding, try answering the following question."
    },
    {
      id: 'cell-quiz-1',
      type: 'quiz',
      question: "What is the main advantage of a decision tree over a more complex model like a neural network?",
      answers: [
        { text: "Higher predictive accuracy on all datasets", isCorrect: false },
        { text: "Better handling of unstructured data like images", isCorrect: false },
        { text: "Easier to interpret and explain the results", isCorrect: true },
        { text: "Requires significantly less data for training", isCorrect: false }
      ],
      explanation: "Decision trees are often called 'white-box' models because their decision-making process is transparent and can be easily visualized and understood. This interpretability is a key advantage over 'black-box' models like neural networks, whose internal workings are much more complex to explain."
    },
    {
      id: 'takeaways',
      type: 'text',
      title: "Key Takeaways",
      content: "In this lesson, you learned that Decision Trees are interpretable, versatile models that mimic human decision-making. You practiced building one with Scikit-learn and now you understand the basic concepts of nodes, branches, and leaves. In the next lesson, we'll explore ensemble methods like Random Forests that build upon this foundation."
    }
  ]
};

const LOGISTIC_REGRESSION_LESSON_DATA: Lesson = {
  id: 'l1-logistic-regression',
  slug: 'logistic-regression',
  title: "Lesson 7: Logistic Regression",
  breadcrumbs: [
      { title: "Classic ML Algorithms", href: "#/dashboard/course?slug=classic-ml-algorithms" }
  ],
  cells: [
    {
      id: 'introduction',
      type: 'text',
      title: "Introduction to Logistic Regression",
      content: "Welcome to Logistic Regression! Despite its name, this algorithm is used for **classification** problems, not regression. It's one of the most fundamental and widely used classification algorithms, providing a great baseline for any classification task."
    },
    {
      id: 'intuition',
      type: 'text',
      title: "The Sigmoid Function",
      content: "The core of Logistic Regression is the **sigmoid function**, which takes any real-valued number and squashes it to a value between 0 and 1. This output can be interpreted as a probability. \n\n*   If the output is greater than 0.5, we classify the input as belonging to class 1.\n*   Otherwise, we classify it as belonging to class 0."
    },
    {
      id: 'practice',
      type: 'text',
      title: "Scikit-learn Practice",
      content: "Let's apply this to a practical example. We'll use a dataset to predict whether a patient has a certain disease based on their age. We'll start by importing the necessary libraries and creating some sample data."
    },
    {
        id: 'cell-code-1',
        type: 'code',
        initialCode: `import numpy as np
from sklearn.linear_model import LogisticRegression
import matplotlib.pyplot as plt

# Sample data: [age, has_disease (0 or 1)]
X = np.array([22, 25, 47, 52, 46, 56, 55, 60, 62, 61, 18, 28, 27, 29, 49, 55, 25, 58, 40, 42]).reshape(-1, 1)
y = np.array([0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1])

# Create and train the model
log_reg = LogisticRegression()
log_reg.fit(X, y)

# Predict for a new person of age 30
prediction = log_reg.predict([[30]])
print(f"Prediction for age 30: {'Has disease' if prediction[0] else 'No disease'}")

# Predict probability for a new person of age 30
probability = log_reg.predict_proba([[30]])
print(f"Probability of having disease for age 30: {probability[0][1]:.2f}")`
    },
    {
      id: 'test',
      type: 'text',
      title: "Test Yourself",
      content: "Check your understanding with this quick question."
    },
    {
      id: 'cell-quiz-1',
      type: 'quiz',
      question: "Logistic Regression is a suitable algorithm for which of the following problems?",
      answers: [
        { text: "Predicting the price of a house", isCorrect: false },
        { text: "Predicting whether an email is spam or not spam", isCorrect: true },
        { text: "Predicting the temperature for tomorrow", isCorrect: false },
        { text: "Grouping customers into different segments", isCorrect: false }
      ],
      explanation: "Logistic Regression is used for binary classification problems, where the outcome is one of two categories. Predicting spam/not spam is a classic example of binary classification."
    }
  ]
};


const lessonsDatabase: Record<string, Lesson> = {
    'decision-trees': DECISION_TREES_LESSON_DATA,
    'logistic-regression': LOGISTIC_REGRESSION_LESSON_DATA
};

export const getLessonBySlug = async (slug: string): Promise<Lesson> => {
    console.log(`Fetching lesson with slug: ${slug}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lesson = lessonsDatabase[slug];

    if (lesson) {
        return lesson;
    } else {
        throw new Error(`Lesson with slug "${slug}" not found.`);
    }
};