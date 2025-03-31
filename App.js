import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const ROWS = 20;
const COLUMNS = 10;
const SHAPES = [
  { shape: [[1, 1, 1, 1]], color: "cyan" },
  { shape: [[1, 1], [1, 1]], color: "yellow" },
  { shape: [[0, 1, 0], [1, 1, 1]], color: "purple" },
  { shape: [[1, 1, 0], [0, 1, 1]], color: "red" },
  { shape: [[0, 1, 1], [1, 1, 0]], color: "green" },
  { shape: [[1, 0, 0], [1, 1, 1]], color: "orange" },
  { shape: [[0, 0, 1], [1, 1, 1]], color: "blue" },
];

const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

const TetrisGame = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))
  );
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [currentPiece, setCurrentPiece] = useState(randomShape());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState("");

  const checkCollision = (x, y, shape) => {
    return shape.some((row, rIdx) =>
      row.some((cell, cIdx) => {
        if (cell) {
          const newX = x + cIdx;
          const newY = y + rIdx;
          if (
            newY >= ROWS ||
            newX < 0 ||
            newX >= COLUMNS ||
            (grid[newY] && grid[newY][newX])
          ) {
            return true;
          }
        }
        return false;
      })
    );
  };

  const clearFullRows = (grid) => {
    const newGrid = grid.filter(row => row.some(cell => !cell));
    const rowsCleared = ROWS - newGrid.length;
    if (rowsCleared > 0) {
      setScore(prevScore => prevScore + rowsCleared * 10);
      while (newGrid.length < ROWS) {
        newGrid.unshift(Array(COLUMNS).fill(0));
      }
    }
    return newGrid;
  };

  const placeShape = async () => {
    const newGrid = grid.map((row) => [...row]);
    currentPiece.shape.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell) {
          newGrid[position.y + rIdx][position.x + cIdx] = currentPiece.color;
        }
      });
    });
    const updatedGrid = clearFullRows(newGrid);
    setGrid(updatedGrid);
    setPosition({ x: 3, y: 0 });
    setCurrentPiece(randomShape());
    if (checkCollision(3, 0, currentPiece.shape)) {
      setGameOver(true);
      Alert.alert("Game Over", `Final Score: ${score}`);
      if (playerName) {
        await addDoc(collection(db, "scores"), {
          name: playerName,
          score: score,
        });
      }
    }
  };

  const moveDown = useCallback(() => {
    if (!checkCollision(position.x, position.y + 1, currentPiece.shape)) {
      setPosition((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      placeShape();
    }
  }, [position, currentPiece, grid]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(moveDown, 500);
    return () => clearInterval(interval);
  }, [moveDown, gameOver]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tetris</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={playerName}
        onChangeText={setPlayerName}
      />
      <Text style={styles.score}>Score: {score}</Text>
      {gameOver && <Text style={styles.gameOver}>Game Over :(</Text>}
      <View style={styles.grid}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isBlock = currentPiece.shape.some((r, rIdx) =>
              r.some((c, cIdx) => c && rowIndex === position.y + rIdx && colIndex === position.x + cIdx)
            );
            const color = isBlock ? currentPiece.color : cell || "white";
            return (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[styles.cell, { backgroundColor: color }]}
              />
            );
          })
        )}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setPosition(prev => ({ ...prev, x: Math.max(prev.x - 1, 0) }))}><Text>⬅</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentPiece({ ...currentPiece, shape: currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i])).reverse() })}><Text>🔄</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPosition(prev => ({ ...prev, x: Math.min(prev.x + 1, COLUMNS - currentPiece.shape[0].length) }))}><Text>➡</Text></TouchableOpacity>
        <TouchableOpacity onPress={moveDown}><Text>⬇</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", alignItems: "center", justifyContent: "center" },
  title: { color: "white", fontSize: 24 },
  input: { backgroundColor: "white", padding: 10, margin: 10, width: 200 },
  score: { color: "white" },
  gameOver: { color: "red", fontSize: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", width: 200, height: 400 },
  cell: { width: 20, height: 20, borderWidth: 1, borderColor: "gray" },
  controls: { flexDirection: "row", marginTop: 20 },
});

export default TetrisGame;

