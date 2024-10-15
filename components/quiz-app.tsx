"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ClipLoader } from 'react-spinners';

type Answer = {
    text: string;
    isCorrect: boolean;
};

type Question = {
    question: string;
    answers: Answer[];
};

type QuizState = {
    currentQuestion: number;
    score: number;
    showResults: boolean;
    questions: Question[];
    isLoading: boolean;
};

// Type definitions for API response
interface ApiResponse {
    results: ApiQuestion[];
}

interface ApiQuestion {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

export default function Quiz() {
    const [state, setState] = useState<QuizState>({
        currentQuestion: 0,
        score: 0,
        showResults: false,
        questions: [],
        isLoading: true,
    });

      // useEffect to fetch quiz questions from API when the
      // component mounts
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(
                    "https://opentdb.com/api.php?amount=10&type=multiple"
                );
                const data: ApiResponse = await response.json();
                const questions = data.results.map((item: ApiQuestion) => {
                    const incorrectAnswers = item.incorrect_answers.map(
                        (answer: string) => ({
                            text: answer,
                            isCorrect: false,
                        })
                    );
                    const correctAnswer = {
                        text: item.correct_answer,
                        isCorrect: true,
                    };
                    return {
                        question: item.question,
                        answers: [...incorrectAnswers, correctAnswer].sort(
                            () => Math.random() - 0.5
                        ),
                    };
                });
                setState((prevState) => ({
                    ...prevState,
                    questions,
                    isLoading: false,
                }));
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        };

        fetchQuestions();
    }, []);

    // Function to handle answer click
    const handleAnswerClick = (isCorrect: boolean): void => {
        if (isCorrect) {
            setState((prevState) => ({ ...prevState, score: prevState.score + 1 }));
        }
        
        const nextQuestion = state.currentQuestion + 1;
        if (nextQuestion < state.questions.length) {
            setState((prevState) => ({ ...prevState, currentQuestion: nextQuestion }));
        } else {
            setState((prevState) => ({ ...prevState, showResults: true }));
        }
    };

    // Function to reset the quiz
    const resetQuiz = (): void => {
        setState({
            currentQuestion: 0,
            score: 0,
            showResults: false,
            questions: state.questions,
            isLoading: false,
        });
    };

      // Show loading spinner if the questions are still loading.
    if (state.isLoading) {
        return (
            <div className='flex flex-col items-center justify-center h-screen bg-background text-foreground'>
                <ClipLoader />
                <p>Loading quiz questions, please wait...</p>
            </div>
        );
    }

    // Show message if no questions are available
    if (state.questions.length === 0) {
        return <div>No questions available.</div>
    }

    // Get the current question
    const currentQuestion = state.questions[state.currentQuestion];

    // JSX return statement rendering the Quiz UI
    return (
        <div className='flex flex-col items-center justify-center h-screen bg-gradient-to-br from-orange-300 via-orange-200 to-orange-400 text-foreground'
        style={{
            backgroundImage: `url('/quizapp.jpg')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
        }}
        >
            {state.showResults ? (
                // Show results if the quiz is finished
                <div className='bg-amber-200 p-8 rounded-lg shadow-2xl w-full max-w-md'>
                    <h2 className='text-2xl font-bold mb-4'>Results</h2>
                    <p className='text-lg mb-4'>
                        You scored {state.score} out of {state.questions.length}
                    </p>
                    <Button
                    onClick={resetQuiz} className='w-full'>
                        Try Again
                    </Button>
                </div>
            ) : (
                // Show current question and answers if the quiz is in progress
                <div className='bg-amber-200 p-8 rounded-xl shadow-2xl w-full max-w-lg'>
                    <h2 className='text-2xl font-bold mb-4'>
                        Question {state.currentQuestion + 1}/{state.questions.length}
                    </h2>
                    <p className='text-lg mb-4'
                    dangerouslySetInnerHTML={{__html: currentQuestion.question}}
                    />
                    <div className='grid gap-4'>
                        {currentQuestion.answers.map((answer, index) => (
                            <Button
                            key={index}
                            onClick={() => handleAnswerClick(answer.isCorrect)}
                            className='w-full rounded-full'
                            >
                                {answer.text}
                            </Button>
                        ))}
                    </div>
                    <div className='mt-4 text-right'>
                        <span>
                            Score: {state.score}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}