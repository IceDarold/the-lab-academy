import * as React from 'react';
import Button from '../../../ui/button';
import type { QuizCell } from '../../../../types';

const QuizCell: React.FC<{ cell: QuizCell }> = ({ cell }) => {
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };
  
  return (
    <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-100">{cell.question}</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {cell.options?.map((option, index) => {
          const isCorrect = index === cell.correctAnswer;
          const isSelected = selectedOption === index;
          
          let stateClasses = "border-gray-600";
          if (isSubmitted) {
            if (isCorrect) stateClasses = "border-green-500 bg-green-500/10";
            else if (isSelected) stateClasses = "border-red-500 bg-red-500/10";
          }

          return (
            <label
              key={index}
              className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${stateClasses} hover:bg-gray-700`}
            >
              <input
                type="radio"
                name="quiz-option"
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500 focus:ring-blue-500"
                onChange={() => setSelectedOption(index)}
                disabled={isSubmitted}
              />
              <span className="ml-3 text-sm text-gray-300">{option}</span>
            </label>
          );
        })}
        <div className="pt-2">
          <Button type="submit" disabled={selectedOption === null || isSubmitted}>
            {isSubmitted ? 'Answered' : 'Submit Answer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizCell;
