import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  bg: '#111113',
  primary: '#10b981',
  secondary: '#1e293b',
  tertiary: '#475569',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#f59e0b',
  danger: '#ef4444',
};

interface GameResult {
  gameId: string;
  score: number;
  time?: number;
  level?: string;
}

// Memory Recall Game
const MemoryRecallGame: React.FC<{
  onClose: () => void;
  onResult: (result: GameResult) => void;
}> = ({ onClose, onResult }) => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const generateSequence = () => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    return newSequence;
  };

  const startGame = () => {
    setGameState('playing');
    const newSeq = generateSequence();
    setTimeout(() => showSequence(newSeq), 500);
  };

  const showSequence = (seq: number[]) => {
    seq.forEach((num, idx) => {
      setTimeout(() => {
        // Visual feedback would be here
      }, (idx + 1) * 600);
    });
  };

  const handlePress = (num: number) => {
    const newUserSeq = [...userSequence, num];
    setUserSequence(newUserSeq);

    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
      endGame();
      return;
    }

    if (newUserSeq.length === sequence.length) {
      setLevel(level + 1);
      setScore(score + 100);
      setUserSequence([]);
      setTimeout(() => {
        const newSeq = generateSequence();
        setTimeout(() => showSequence(newSeq), 500);
      }, 1000);
    }
  };

  const endGame = () => {
    setGameState('result');
    onResult({ gameId: 'memory', score });
  };

  if (gameState === 'setup') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.gameTitle}>Memory Recall</Text>
        <Text style={styles.gameDesc}>
          Memorize the sequence and tap the buttons in the same order
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === 'result') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.resultTitle}>Game Over</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Final Score</Text>
          <Text style={styles.resultScore}>{score}</Text>
          <Text style={styles.resultLabel}>Level Reached: {level}</Text>
        </View>
        <TouchableOpacity
          style={styles.resultButton}
          onPress={() => {
            setGameState('setup');
            setSequence([]);
            setUserSequence([]);
            setLevel(1);
            setScore(0);
          }}
        >
          <Text style={styles.resultButtonText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resultButton, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <Text style={styles.gameTitle}>Memory Recall</Text>
      <View style={styles.scoreDisplay}>
        <Text style={styles.scoreLabel}>Level {level}</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>
      <View style={styles.gridGame}>
        {[0, 1, 2, 3].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.gridButton,
              { backgroundColor: num < 2 ? COLORS.primary : COLORS.accent },
            ]}
            onPress={() => handlePress(num)}
          >
            <Text style={styles.gridButtonText}>{num + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Math Blitz Game
const MathBlitzGame: React.FC<{
  onClose: () => void;
  onResult: (result: GameResult) => void;
}> = ({ onClose, onResult }) => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-'>('+');
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft === 0) {
      endGame();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const generateProblem = () => {
    const newNum1 = Math.floor(Math.random() * 100) + 1;
    const newNum2 = Math.floor(Math.random() * 100) + 1;
    const newOperator = Math.random() > 0.5 ? '+' : '-' as '+' | '-';
    setNum1(newNum1);
    setNum2(newNum2);
    setOperator(newOperator);
    setUserAnswer('');
  };

  const startGame = () => {
    generateProblem();
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
  };

  const checkAnswer = () => {
    const answer = parseInt(userAnswer, 10);
    const correct = operator === '+' ? num1 + num2 : num1 - num2;

    if (answer === correct) {
      setScore(score + 10);
      generateProblem();
    } else {
      Alert.alert('Incorrect', `The answer was ${correct}`);
      generateProblem();
    }
  };

  const endGame = () => {
    setGameState('result');
  };

  if (gameState === 'setup') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.gameTitle}>Math Blitz</Text>
        <Text style={styles.gameDesc}>Solve as many math problems as you can in 30 seconds</Text>
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === 'result') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.resultTitle}>Time's Up!</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Final Score</Text>
          <Text style={styles.resultScore}>{score}</Text>
          <Text style={styles.resultLabel}>Problems Solved: {score / 10}</Text>
        </View>
        <TouchableOpacity
          style={styles.resultButton}
          onPress={() => {
            setGameState('setup');
            setScore(0);
            setTimeLeft(30);
          }}
        >
          <Text style={styles.resultButtonText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resultButton, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <Text style={styles.gameTitle}>Math Blitz</Text>
      <View style={styles.gameHeader}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={[styles.timerValue, timeLeft < 10 && styles.timerWarning]}>
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.mathProblem}>
        <Text style={styles.mathText}>{num1}</Text>
        <Text style={styles.mathOperator}>{operator}</Text>
        <Text style={styles.mathText}>{num2}</Text>
        <Text style={styles.mathEquals}>=</Text>
        <Text style={styles.mathQuestion}>?</Text>
      </View>

      <View style={styles.answerInput}>
        <Text style={styles.answerLabel}>Your Answer:</Text>
        <Text style={styles.answerValue}>{userAnswer || '...'}</Text>
      </View>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numButton}
            onPress={() => setUserAnswer(userAnswer + num.toString())}
          >
            <Text style={styles.numButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mathControls}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setUserAnswer(userAnswer.slice(0, -1))}
        >
          <MaterialCommunityIcons name="backspace" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={checkAnswer}
          disabled={!userAnswer}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stroop Test Game
const StroopTestGame: React.FC<{
  onClose: () => void;
  onResult: (result: GameResult) => void;
}> = ({ onClose, onResult }) => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');

  const COLORS_ARR = ['red', 'blue', 'green', 'yellow'];
  const WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft === 0) {
      endGame();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const generateStroop = () => {
    const wordIndex = Math.floor(Math.random() * WORDS.length);
    const colorIndex = Math.floor(Math.random() * COLORS_ARR.length);
    setCurrentWord(WORDS[wordIndex]);
    setCurrentColor(COLORS_ARR[colorIndex]);
  };

  const getColorValue = (color: string) => {
    switch (color) {
      case 'red':
        return '#ef4444';
      case 'blue':
        return '#3b82f6';
      case 'green':
        return '#10b981';
      case 'yellow':
        return '#f59e0b';
      default:
        return COLORS.text;
    }
  };

  const startGame = () => {
    generateStroop();
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
  };

  const handleColorClick = (color: string) => {
    if (color === currentColor) {
      setScore(score + 5);
      generateStroop();
    } else {
      Alert.alert('Wrong', `The text color was ${currentColor}`);
      generateStroop();
    }
  };

  const endGame = () => {
    setGameState('result');
  };

  if (gameState === 'setup') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.gameTitle}>Stroop Test</Text>
        <Text style={styles.gameDesc}>Click the actual color of the text, not the word</Text>
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === 'result') {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.resultTitle}>Time's Up!</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Final Score</Text>
          <Text style={styles.resultScore}>{score}</Text>
          <Text style={styles.resultLabel}>Correct Answers: {score / 5}</Text>
        </View>
        <TouchableOpacity
          style={styles.resultButton}
          onPress={() => {
            setGameState('setup');
            setScore(0);
            setTimeLeft(30);
          }}
        >
          <Text style={styles.resultButtonText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resultButton, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <Text style={styles.gameTitle}>Stroop Test</Text>
      <View style={styles.gameHeader}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={[styles.timerValue, timeLeft < 10 && styles.timerWarning]}>
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.stroopDisplay}>
        <Text
          style={[
            styles.stroopText,
            { color: getColorValue(currentColor) },
          ]}
        >
          {currentWord}
        </Text>
        <Text style={styles.stroopInstruction}>Pick the text color</Text>
      </View>

      <View style={styles.colorGrid}>
        {COLORS_ARR.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: getColorValue(color) },
            ]}
            onPress={() => handleColorClick(color)}
          >
            <Text style={styles.colorButtonLabel}>{color}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'playable' | 'coming-soon';
  component?: React.ComponentType<any>;
}

const GAMES: Game[] = [
  {
    id: 'memory',
    name: 'Memory Recall',
    description: 'Memorize and repeat sequences',
    icon: 'brain',
    status: 'playable',
    component: MemoryRecallGame,
  },
  {
    id: 'math',
    name: 'Math Blitz',
    description: '30-second timed math challenges',
    icon: 'calculator',
    status: 'playable',
    component: MathBlitzGame,
  },
  {
    id: 'stroop',
    name: 'Stroop Test',
    description: 'Color perception challenge',
    icon: 'palette',
    status: 'playable',
    component: StroopTestGame,
  },
  {
    id: 'find-it',
    name: 'Find It Fast',
    description: 'Visual search game',
    icon: 'magnify',
    status: 'coming-soon',
  },
  {
    id: 'word',
    name: 'Word Scramble',
    description: 'Unscramble words quickly',
    icon: 'text-search',
    status: 'coming-soon',
  },
  {
    id: 'breath',
    name: 'Breath Hold',
    description: 'Breathing endurance challenge',
    icon: 'lungs',
    status: 'coming-soon',
  },
];

const GameCard: React.FC<{
  game: Game;
  onPress: (game: Game) => void;
}> = ({ game, onPress }) => (
  <TouchableOpacity
    style={styles.gameCard}
    onPress={() => onPress(game)}
    disabled={game.status === 'coming-soon'}
  >
    <View style={styles.gameCardIcon}>
      <MaterialCommunityIcons
        name={game.icon as any}
        size={32}
        color={game.status === 'coming-soon' ? COLORS.tertiary : COLORS.primary}
      />
    </View>
    <Text style={styles.gameCardName}>{game.name}</Text>
    <Text style={styles.gameCardDesc}>{game.description}</Text>
    {game.status === 'coming-soon' && (
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleGameSelect = (game: Game) => {
    if (game.status === 'playable') {
      setSelectedGame(game);
    }
  };

  const handleGameClose = () => {
    setSelectedGame(null);
    setGameResult(null);
  };

  const handleGameResult = (result: GameResult) => {
    setGameResult(result);
  };

  if (selectedGame && selectedGame.component) {
    const GameComponent = selectedGame.component;
    return (
      <Modal visible={!!selectedGame} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleGameClose}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedGame.name}</Text>
            <View style={{ width: 28 }} />
          </View>
          <GameComponent onClose={handleGameClose} onResult={handleGameResult} />
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Distraction Games</Text>
        <Text style={styles.headerDesc}>Take a mental break and refocus</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.gameGrid}
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={handleGameSelect}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  gameGrid: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  gameCard: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  gameCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  gameCardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  comingSoonBadge: {
    marginTop: 10,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Game Container
  gameContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  gameDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  timerBox: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timerWarning: {
    color: COLORS.danger,
  },
  scoreBox: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  // Memory Game
  gridGame: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  gridButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  gridButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.bg,
  },
  // Math Blitz
  mathProblem: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  mathText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  mathOperator: {
    fontSize: 28,
    color: COLORS.primary,
    marginHorizontal: 8,
  },
  mathEquals: {
    fontSize: 28,
    color: COLORS.primary,
    marginHorizontal: 8,
  },
  mathQuestion: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.accent,
  },
  answerInput: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  answerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numButton: {
    width: '31%',
    aspectRatio: 1.2,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  numButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  mathControls: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg,
  },
  // Stroop Test
  stroopDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stroopText: {
    fontSize: 64,
    fontWeight: '800',
    marginBottom: 12,
  },
  stroopInstruction: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  colorButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  colorButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bg,
  },
  // Results
  resultTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  resultBox: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
  },
  resultButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg,
  },
  closeButton: {
    backgroundColor: COLORS.secondary,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});
