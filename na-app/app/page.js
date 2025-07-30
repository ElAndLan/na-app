"use client";
import React, { useState, useEffect } from "react";
import { Sword, Shield, Zap, Heart, Clock, Users } from "lucide-react";
import CharacterCard from "./components/CharacterCard/CharacterCard";
import characters from "../public/Characters/characters"; // Import the characters
import styles from "./page.module.css";

const NarutoArenaEngine = () => {
  // Game state
  const [gameState, setGameState] = useState("battle");
  const [currentTurn, setCurrentTurn] = useState(1);
  const [activePlayer, setActivePlayer] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnActions, setTurnActions] = useState([]);

  // Turn timer state
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Chakra pools for each player
  const [player1Chakra, setPlayer1Chakra] = useState({
    taijutsu: 0,
    ninjutsu: 0,
    bloodline: 0,
    genjutsu: 0,
    random: 0,
  });

  const [player2Chakra, setPlayer2Chakra] = useState({
    taijutsu: 0,
    ninjutsu: 0,
    bloodline: 0,
    genjutsu: 0,
    random: 0,
  });

  // Player teams
  const [player1Team, setPlayer1Team] = useState([]);
  const [player2Team, setPlayer2Team] = useState([]);

  // Cooldown tracking
  const [cooldowns, setCooldowns] = useState({
    player1: {},
    player2: {},
  });

  // Convert characters object to array for easier use
  const charactersArray = Object.values(characters);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (timerActive && turnTimeLeft > 0 && gameState === "battle") {
      interval = setInterval(() => {
        setTurnTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer reached zero, end turn automatically
            setTimerActive(false);
            setTimeout(() => endTurn(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (turnTimeLeft === 0) {
      setTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, turnTimeLeft, gameState]);

  // Generate chakra based on alive characters
  const generateChakraForPlayer = React.useCallback(
    (playerNum, chakraAmount) => {
      const chakraTypes = [
        "taijutsu",
        "ninjutsu",
        "bloodline",
        "genjutsu",
        "random",
      ];

      for (let i = 0; i < chakraAmount; i++) {
        const newChakra =
          chakraTypes[Math.floor(Math.random() * chakraTypes.length)];

        if (playerNum === 1) {
          setPlayer1Chakra((prev) => ({
            ...prev,
            [newChakra]: prev[newChakra] + 1,
          }));
        } else {
          setPlayer2Chakra((prev) => ({
            ...prev,
            [newChakra]: prev[newChakra] + 1,
          }));
        }
      }
    },
    []
  );

  // Initialize teams with characters and set random starting player
  useEffect(() => {
    if (player1Team.length === 0 && !gameStarted) {
      // Initialize player teams with characters
      setPlayer1Team([
        { ...charactersArray[0], currentHealth: charactersArray[0].health },
        { ...charactersArray[1], currentHealth: charactersArray[1].health },
        { ...charactersArray[2], currentHealth: charactersArray[2].health },
      ]);
      setPlayer2Team([
        { ...charactersArray[0], currentHealth: charactersArray[0].health },
        { ...charactersArray[1], currentHealth: charactersArray[1].health },
        { ...charactersArray[2], currentHealth: charactersArray[2].health },
      ]);
      const randomStartingPlayer = Math.random() < 0.5 ? 1 : 2;
      setActivePlayer(randomStartingPlayer);
      generateChakraForPlayer(randomStartingPlayer, 1);
      setGameStarted(true);
      // Start timer for first turn
      setTurnTimeLeft(30);
      setTimerActive(true);
    }
  }, [
    gameStarted,
    player1Team.length,
    charactersArray,
    generateChakraForPlayer,
  ]);

  // Count alive characters for a player
  const countAliveCharacters = (team) => {
    return team.filter((char) => char.currentHealth > 0).length;
  };

  // Check if player has required chakra for skill
  const canUseSkill = (skill, playerChakra) => {
    let tempChakra = { ...playerChakra };
    return skill.chakraReq.every((reqType) => {
      if (tempChakra[reqType] > 0) {
        tempChakra[reqType]--;
        return true;
      }
      if (tempChakra.random > 0) {
        tempChakra.random--;
        return true;
      }
      return false;
    });
  };

  // Consume chakra for skill
  const consumeChakra = (skill, playerNum) => {
    const chakraPool = playerNum === 1 ? player1Chakra : player2Chakra;
    const setChakraPool = playerNum === 1 ? setPlayer1Chakra : setPlayer2Chakra;

    let newChakra = { ...chakraPool };

    skill.chakraReq.forEach((reqType) => {
      if (newChakra[reqType] > 0) {
        newChakra[reqType]--;
      } else if (newChakra.random > 0) {
        newChakra.random--;
      }
    });

    setChakraPool(newChakra);
  };

  const handleCharacterSelect = (player, characterIndex) => {
    const targetCharacter = (player === 1 ? player1Team : player2Team)[
      characterIndex
    ];

    // If character is defeated, do nothing
    if (targetCharacter.currentHealth <= 0) return;

    // Scenario 1: A skill is selected, and the clicked character is a potential target
    if (selectedSkill && selectedCharacter) {
      // Ensure the selected character is the active player's character
      if (selectedCharacter.player === activePlayer) {
        handleSkillUse(player, characterIndex); // Call handleSkillUse with the target
        return;
      }
    }

    // Scenario 2: No skill is selected, or the clicked character is the active player's own character
    // This means we are trying to select a character to use a skill
    if (player === activePlayer) {
      setSelectedCharacter({ player, index: characterIndex });
      setSelectedSkill(null); // Clear any previously selected skill when selecting a new character
    }
  };

  const handleSkillSelect = (skill) => {
    // Only allow skill selection if a character is already selected and it's the active player's character
    if (selectedCharacter && selectedCharacter.player === activePlayer) {
      setSelectedSkill(skill);
    }
  };

  const handleSkillUse = (targetPlayer, targetCharIndex) => {
    if (!selectedSkill || !selectedCharacter) return; // Should not happen if logic is correct

    const actingPlayerNum = selectedCharacter.player;
    const actingCharIndex = selectedCharacter.index;
    const currentPlayerTeam = actingPlayerNum === 1 ? player1Team : player2Team;
    const actingChar = currentPlayerTeam[actingCharIndex];
    const currentPlayerChakra =
      actingPlayerNum === 1 ? player1Chakra : player2Chakra;

    // Check chakra requirements
    if (!canUseSkill(selectedSkill, currentPlayerChakra)) {
      setSelectedSkill(null); // Clear selected skill if cannot use
      setSelectedCharacter(null); // Clear selected character
      return;
    }

    // Check cooldown
    const playerCooldowns = cooldowns[`player${actingPlayerNum}`];
    const skillKey = `${actingChar.id}_${selectedSkill.id}`;
    if (playerCooldowns[skillKey] && playerCooldowns[skillKey] > 0) {
      setSelectedSkill(null); // Clear selected skill if on cooldown
      setSelectedCharacter(null); // Clear selected character
      return;
    }

    // Add action to turnActions for deferred application
    setTurnActions((prev) => [
      ...prev,
      {
        actingPlayer: actingPlayerNum,
        actingCharIndex: actingCharIndex,
        skill: selectedSkill,
        targetPlayer: targetPlayer,
        targetCharIndex: targetCharIndex,
      },
    ]);

    // Consume chakra immediately
    consumeChakra(selectedSkill, actingPlayerNum);

    // Set cooldown immediately
    setCooldowns((prev) => ({
      ...prev,
      [`player${actingPlayerNum}`]: {
        ...prev[`player${actingPlayerNum}`],
        [skillKey]: selectedSkill.cooldown,
      },
    }));

    // Clear selected skill and character after action is queued
    setSelectedSkill(null);
    setSelectedCharacter(null);
  };

  // New function to apply all accumulated effects at the end of the turn
  const applyTurnEffects = () => {
    if (turnActions.length === 0) return; // No actions to apply

    let newPlayer1Team = [...player1Team];
    let newPlayer2Team = [...player2Team];

    turnActions.forEach((action) => {
      const {
        actingPlayer,
        actingCharIndex,
        skill,
        targetPlayer,
        targetCharIndex,
      } = action;

      // Get mutable references to characters from the new teams
      const actingChar = (actingPlayer === 1 ? newPlayer1Team : newPlayer2Team)[
        actingCharIndex
      ];
      let targetChar = (targetPlayer === 1 ? newPlayer1Team : newPlayer2Team)[
        targetCharIndex
      ];

      // Ensure characters are still valid and alive before applying effect
      if (!actingChar || actingChar.currentHealth <= 0) {
        return;
      }
      if (!targetChar || targetChar.currentHealth <= 0) {
        return;
      }

      if (skill.effect === "heal") {
        const healAmount = Math.abs(skill.damage);
        const newHealth = Math.min(
          targetChar.health,
          targetChar.currentHealth + healAmount
        );
        targetChar.currentHealth = newHealth;
      } else {
        const newHealth = Math.max(0, targetChar.currentHealth - skill.damage);
        targetChar.currentHealth = newHealth;
      }
    });

    setPlayer1Team(newPlayer1Team);
    setPlayer2Team(newPlayer2Team);
    setTurnActions([]); // Clear actions after applying
  };

  const endTurn = () => {
    // Stop the timer
    setTimerActive(false);

    // Apply all queued actions from the current turn
    applyTurnEffects();

    // Check for game over condition after applying effects
    // Use a setTimeout to ensure state updates from applyTurnEffects are processed
    setTimeout(() => {
      const player1Alive = countAliveCharacters(player1Team);
      const player2Alive = countAliveCharacters(player2Team);

      if (player1Alive === 0) {
        setGameState("victory");
        return;
      }
      if (player2Alive === 0) {
        setGameState("victory");
        return;
      }

      // Switch active player
      const nextPlayer = activePlayer === 1 ? 2 : 1;
      setActivePlayer(nextPlayer);
      setCurrentTurn((prev) => prev + 1);

      // Generate chakra for next player based on their alive characters
      const nextPlayerTeam = nextPlayer === 1 ? player1Team : player2Team;
      const aliveCharacters = countAliveCharacters(nextPlayerTeam);

      if (aliveCharacters > 0) {
        generateChakraForPlayer(nextPlayer, aliveCharacters);
      }

      // Reduce cooldowns for ALL characters (both players)
      setCooldowns((prev) => {
        const newCooldowns = { ...prev };
        Object.keys(newCooldowns.player1).forEach((key) => {
          if (newCooldowns.player1[key] > 0) {
            newCooldowns.player1[key]--;
          }
        });
        Object.keys(newCooldowns.player2).forEach((key) => {
          if (newCooldowns.player2[key] > 0) {
            newCooldowns.player2[key]--;
          }
        });
        return newCooldowns;
      });

      setSelectedCharacter(null);
      setSelectedSkill(null);

      // Reset and start timer for next player
      setTurnTimeLeft(30);
      setTimerActive(true);
    }, 100); // Small delay to ensure state updates
  };

  const resetGame = () => {
    setCurrentTurn(1);
    setSelectedCharacter(null);
    setSelectedSkill(null);
    setCooldowns({ player1: {}, player2: {} });
    setGameStarted(false);
    setTurnActions([]); // Clear any pending actions
    // Reset timer
    setTurnTimeLeft(30);
    setTimerActive(false);

    // Reset chakra pools
    setPlayer1Chakra({
      taijutsu: 0,
      ninjutsu: 0,
      bloodline: 0,
      genjutsu: 0,
      random: 0,
    });
    setPlayer2Chakra({
      taijutsu: 0,
      ninjutsu: 0,
      bloodline: 0,
      genjutsu: 0,
      random: 0,
    });

    // Reset character health using imported characters
    setPlayer1Team([
      { ...charactersArray[0], currentHealth: charactersArray[0].health },
      { ...charactersArray[1], currentHealth: charactersArray[1].health },
      { ...charactersArray[2], currentHealth: charactersArray[2].health },
    ]);
    setPlayer2Team([
      { ...charactersArray[0], currentHealth: charactersArray[0].health },
      { ...charactersArray[1], currentHealth: charactersArray[1].health },
      { ...charactersArray[2], currentHealth: charactersArray[2].health },
    ]);

    // Set new random starting player
    const randomStartingPlayer = Math.random() < 0.5 ? 1 : 2;
    setActivePlayer(randomStartingPlayer);

    // Generate initial chakra for the new starting player
    setTimeout(() => {
      generateChakraForPlayer(randomStartingPlayer, 1);
      setGameStarted(true);
      setGameState("battle"); // Set game state back to battle
      // Start timer for new game
      setTurnTimeLeft(30);
      setTimerActive(true);
    }, 100);
  };

  // Determine if characters are targetable for visual feedback
  const getTargetableCharacters = () => {
    if (!selectedSkill || !selectedCharacter) return [];

    const targetable = [];
    // All characters can be targeted (including same team for heals)
    player1Team.forEach((char, index) => {
      if (char.currentHealth > 0) {
        targetable.push({ player: 1, index });
      }
    });
    player2Team.forEach((char, index) => {
      if (char.currentHealth > 0) {
        targetable.push({ player: 2, index });
      }
    });
    return targetable;
  };

  const targetableCharacters = getTargetableCharacters();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Naruto Arena Engine</h1>
      {/* Pending Actions */}
      {turnActions.length > 0 && (
        <div className={styles.pendingActions}>
          <h4 className={styles.pendingActionsTitle}>
            Queued Actions for this turn:
          </h4>
          {turnActions.map((action, index) => {
            const actingChar = (
              action.actingPlayer === 1 ? player1Team : player2Team
            )[action.actingCharIndex];
            const targetChar = (
              action.targetPlayer === 1 ? player1Team : player2Team
            )[action.targetCharIndex];
            return (
              <div key={index} className={styles.pendingActionItem}>
                {actingChar.name} will use {action.skill.name} on{" "}
                {targetChar.name}
              </div>
            );
          })}
        </div>
      )}
      {/* Chakra Pool - Active Player Only */}
      {activePlayer && (
        <div className={styles.activeChakraPool}>
          {/* Turn Timer */}
          {gameState === "battle" && (
            <div className={styles.timerContainer}>
              <div className={styles.timerBarContainer}>
                <div
                  className={styles.timerBar}
                  style={{
                    width: `${(turnTimeLeft / 30) * 100}%`,
                    backgroundColor:
                      turnTimeLeft <= 10
                        ? "#ef4444"
                        : turnTimeLeft <= 20
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                />
              </div>
            </div>
          )}
          <div className={styles.chakraDisplay}>
            {Object.entries(
              activePlayer === 1 ? player1Chakra : player2Chakra
            ).map(([type, amount]) => (
              <div key={type} className={styles.chakraTypeDisplay}>
                <div
                  className={`${styles.chakraSquare} ${
                    styles[
                      `chakra${type.charAt(0).toUpperCase() + type.slice(1)}`
                    ]
                  }`}
                ></div>
                <span className={styles.chakraAmount}>{amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Game Over / Victory Screen */}
      {gameState === "victory" && (
        <div className={styles.victoryOverlay}>
          <div className={styles.victoryModal}>
            <h2 className={styles.victoryTitle}>Game Over!</h2>
            <p className={styles.victoryMessage}>
              {countAliveCharacters(player1Team) === 0
                ? "Player 2 wins!"
                : "Player 1 wins!"}
            </p>
            <button onClick={resetGame} className={styles.playAgainButton}>
              Play Again
            </button>
          </div>
        </div>
      )}
      {/* Target Selection Info */}
      {selectedSkill && selectedCharacter && (
        <div className={styles.targetSelectionInfo}>
          <h3 className={styles.targetSelectionTitle}>
            {selectedSkill.name} selected by{" "}
            {selectedCharacter.player === 1
              ? player1Team[selectedCharacter.index]?.name
              : player2Team[selectedCharacter.index]?.name}{" "}
            - Click on a character to target them!
          </h3>
          <p className={styles.targetSelectionDetails}>
            Damage:{" "}
            {selectedSkill.damage > 0
              ? `${selectedSkill.damage} DMG`
              : selectedSkill.damage < 0
              ? `${Math.abs(selectedSkill.damage)} HP`
              : "Special"}{" "}
            | Chakra: {selectedSkill.chakraReq.join(", ")} | Cooldown:{" "}
            {selectedSkill.cooldown}
          </p>
        </div>
      )}
      <div className={styles.teamsGrid}>
        {/* Player 1 Team */}
        <div className={styles.teamPanel}>
          <h2 className={`${styles.teamTitle} ${styles.player1TeamTitle}`}>
            Player 1 Team
          </h2>
          <div className={styles.teamCharacters}>
            {player1Team.map((character, index) => (
              <CharacterCard
                key={`p1-${index}`}
                character={character}
                characterIndex={index}
                player={1}
                activePlayer={activePlayer}
                selectedCharacter={selectedCharacter}
                selectedSkill={selectedSkill}
                onCharacterSelect={handleCharacterSelect}
                onSkillSelect={handleSkillSelect}
                canUseSkill={canUseSkill}
                cooldowns={cooldowns}
                playerChakra={player1Chakra}
                isTargetable={targetableCharacters.some(
                  (t) => t.player === 1 && t.index === index
                )}
              />
            ))}
          </div>
        </div>

        {/* Player 2 Team */}
        <div className={styles.teamPanel}>
          <h2 className={`${styles.teamTitle} ${styles.player2TeamTitle}`}>
            Player 2 Team
          </h2>
          <div className={styles.teamCharacters}>
            {player2Team.map((character, index) => (
              <CharacterCard
                key={`p2-${index}`}
                character={character}
                characterIndex={index}
                player={2}
                activePlayer={activePlayer}
                selectedCharacter={selectedCharacter}
                selectedSkill={selectedSkill}
                onCharacterSelect={handleCharacterSelect}
                onSkillSelect={handleSkillSelect}
                canUseSkill={canUseSkill}
                cooldowns={cooldowns}
                playerChakra={player2Chakra}
                isTargetable={targetableCharacters.some(
                  (t) => t.player === 2 && t.index === index
                )}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlsContent}>
          <button
            onClick={endTurn}
            className={`${styles.button} ${styles.endTurnButton}`}
          >
            End Turn
          </button>
          <button
            onClick={resetGame}
            className={`${styles.button} ${styles.resetButton}`}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default NarutoArenaEngine;
