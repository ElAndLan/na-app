"use client";
import React, { useState, useEffect } from "react";
import { Sword, Shield, Zap, Heart, Clock, Users } from "lucide-react";

const NarutoArenaEngine = () => {
  // Game state
  const [gameState, setGameState] = useState("setup"); // setup, battle, victory
  const [currentTurn, setCurrentTurn] = useState(1);
  const [activePlayer, setActivePlayer] = useState(null); // Will be set randomly
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  // Chakra pools for each player
  const [player1Chakra, setPlayer1Chakra] = useState({
    taijutsu: 0, // Green
    ninjutsu: 0, // Blue
    bloodline: 0, // Red
    genjutsu: 0, // White
    random: 0, // Black
  });

  const [player2Chakra, setPlayer2Chakra] = useState({
    taijutsu: 0, // Green
    ninjutsu: 0, // Blue
    bloodline: 0, // Red
    genjutsu: 0, // White
    random: 0, // Black
  });

  // Character database
  const characters = [
    {
      id: "naruto",
      name: "Naruto Uzumaki",
      health: 100,
      skills: [
        {
          id: "rasengan",
          name: "Rasengan",
          damage: 30,
          chakraReq: ["ninjutsu"],
          cooldown: 3,
          type: "Physical",
        },
        {
          id: "shadow_clone",
          name: "Shadow Clone",
          damage: 15,
          chakraReq: ["ninjutsu"],
          cooldown: 2,
          type: "Mental",
        },
        {
          id: "nine_tails",
          name: "Nine Tails Chakra",
          damage: 45,
          chakraReq: ["bloodline", "ninjutsu"],
          cooldown: 5,
          type: "Chakra",
        },
      ],
    },
    {
      id: "sasuke",
      name: "Sasuke Uchiha",
      health: 95,
      skills: [
        {
          id: "chidori",
          name: "Chidori",
          damage: 35,
          chakraReq: ["ninjutsu"],
          cooldown: 3,
          type: "Physical",
        },
        {
          id: "fire_ball",
          name: "Fire Ball Jutsu",
          damage: 20,
          chakraReq: ["ninjutsu"],
          cooldown: 2,
          type: "Chakra",
        },
        {
          id: "sharingan",
          name: "Sharingan",
          damage: 0,
          chakraReq: ["bloodline"],
          cooldown: 4,
          type: "Mental",
          effect: "counter",
        },
      ],
    },
    {
      id: "sakura",
      name: "Sakura Haruno",
      health: 85,
      skills: [
        {
          id: "chakra_punch",
          name: "Chakra Enhanced Punch",
          damage: 25,
          chakraReq: ["taijutsu"],
          cooldown: 2,
          type: "Physical",
        },
        {
          id: "heal",
          name: "Medical Jutsu",
          damage: -30,
          chakraReq: ["ninjutsu"],
          cooldown: 3,
          type: "Mental",
          effect: "heal",
        },
        {
          id: "poison",
          name: "Poison Mist",
          damage: 15,
          chakraReq: ["genjutsu"],
          cooldown: 4,
          type: "Chakra",
          effect: "poison",
        },
      ],
    },
  ];

  // Player teams
  const [player1Team, setPlayer1Team] = useState([]);
  const [player2Team, setPlayer2Team] = useState([]);
  const [player1ActiveChar, setPlayer1ActiveChar] = useState(0);
  const [player2ActiveChar, setPlayer2ActiveChar] = useState(0);

  // Cooldown tracking
  const [cooldowns, setCooldowns] = useState({
    player1: {},
    player2: {},
  });

  // Initialize teams with characters and set random starting player
  useEffect(() => {
    if (player1Team.length === 0) {
      setPlayer1Team([
        { ...characters[0], currentHealth: characters[0].health },
        { ...characters[1], currentHealth: characters[1].health },
        { ...characters[2], currentHealth: characters[2].health },
      ]);
      setPlayer2Team([
        { ...characters[0], currentHealth: characters[0].health },
        { ...characters[1], currentHealth: characters[1].health },
        { ...characters[2], currentHealth: characters[2].health },
      ]);

      // Set random starting player
      const randomStartingPlayer = Math.random() < 0.5 ? 1 : 2;
      setActivePlayer(randomStartingPlayer);

      // Generate initial chakra for the starting player
      generateChakraForPlayer(randomStartingPlayer, 1);

      addToBattleLog(`Player ${randomStartingPlayer} goes first!`);
      setGameStarted(true);
    }
  }, []);

  const addToBattleLog = (message) => {
    setBattleLog((prev) => [...prev, `Turn ${currentTurn}: ${message}`]);
  };

  // Count alive characters for a player
  const countAliveCharacters = (team) => {
    return team.filter((char) => char.currentHealth > 0).length;
  };

  // Generate chakra based on alive characters
  const generateChakraForPlayer = (playerNum, chakraAmount) => {
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

      addToBattleLog(
        `Player ${playerNum} gained 1 ${
          newChakra.charAt(0).toUpperCase() + newChakra.slice(1)
        } chakra`
      );
    }
  };

  // Generate new chakra at start of turn
  const generateChakra = () => {
    const currentPlayerTeam = activePlayer === 1 ? player1Team : player2Team;
    const aliveCharacters = countAliveCharacters(currentPlayerTeam);

    if (aliveCharacters > 0) {
      generateChakraForPlayer(activePlayer, aliveCharacters);
    }
  };

  // Check if player has required chakra for skill
  const canUseSkill = (skill, playerChakra) => {
    return skill.chakraReq.every((reqType) => {
      if (playerChakra[reqType] > 0) return true;
      if (playerChakra.random > 0) return true;
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

  const handleSkillUse = (skill, targetPlayer, targetCharIndex) => {
    const currentPlayerTeam = activePlayer === 1 ? player1Team : player2Team;
    const currentCharIndex =
      activePlayer === 1 ? player1ActiveChar : player2ActiveChar;
    const currentChar = currentPlayerTeam[currentCharIndex];
    const currentPlayerChakra =
      activePlayer === 1 ? player1Chakra : player2Chakra;

    // Check chakra requirements
    if (!canUseSkill(skill, currentPlayerChakra)) {
      addToBattleLog(
        `${currentChar.name} doesn't have the required chakra types!`
      );
      return;
    }

    // Check cooldown
    const playerCooldowns = cooldowns[`player${activePlayer}`];
    const skillKey = `${currentChar.id}_${skill.id}`;
    if (playerCooldowns[skillKey] && playerCooldowns[skillKey] > 0) {
      addToBattleLog(
        `${skill.name} is on cooldown for ${playerCooldowns[skillKey]} more turns!`
      );
      return;
    }

    // Apply skill effect
    const targetTeam = targetPlayer === 1 ? player1Team : player2Team;
    const targetChar = targetTeam[targetCharIndex];

    if (skill.effect === "heal") {
      // Healing skill
      const healAmount = Math.abs(skill.damage);
      const newHealth = Math.min(
        targetChar.health,
        targetChar.currentHealth + healAmount
      );

      if (targetPlayer === 1) {
        const newTeam = [...player1Team];
        newTeam[targetCharIndex].currentHealth = newHealth;
        setPlayer1Team(newTeam);
      } else {
        const newTeam = [...player2Team];
        newTeam[targetCharIndex].currentHealth = newHealth;
        setPlayer2Team(newTeam);
      }

      addToBattleLog(
        `${currentChar.name} healed ${targetChar.name} for ${healAmount} HP!`
      );
    } else {
      // Damage skill
      const newHealth = Math.max(0, targetChar.currentHealth - skill.damage);

      if (targetPlayer === 1) {
        const newTeam = [...player1Team];
        newTeam[targetCharIndex].currentHealth = newHealth;
        setPlayer1Team(newTeam);
      } else {
        const newTeam = [...player2Team];
        newTeam[targetCharIndex].currentHealth = newHealth;
        setPlayer2Team(newTeam);
      }

      addToBattleLog(
        `${currentChar.name} used ${skill.name} on ${targetChar.name} for ${skill.damage} damage!`
      );
    }

    // Consume chakra
    consumeChakra(skill, activePlayer);

    // Set cooldown
    setCooldowns((prev) => ({
      ...prev,
      [`player${activePlayer}`]: {
        ...prev[`player${activePlayer}`],
        [skillKey]: skill.cooldown,
      },
    }));

    // Clear selected skill and end turn
    setSelectedSkill(null);
    setSelectedCharacter(null);
    endTurn();
  };

  const endTurn = () => {
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

    // Reduce cooldowns
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
  };

  const resetGame = () => {
    setCurrentTurn(1);
    setBattleLog([]);
    setSelectedCharacter(null);
    setSelectedSkill(null);
    setCooldowns({ player1: {}, player2: {} });
    setGameStarted(false);

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

    // Reset character health
    setPlayer1Team((prev) =>
      prev.map((char) => ({
        ...char,
        currentHealth: char.health,
      }))
    );
    setPlayer2Team((prev) =>
      prev.map((char) => ({
        ...char,
        currentHealth: char.health,
      }))
    );

    // Set new random starting player
    const randomStartingPlayer = Math.random() < 0.5 ? 1 : 2;
    setActivePlayer(randomStartingPlayer);

    // Generate initial chakra for the new starting player
    setTimeout(() => {
      generateChakraForPlayer(randomStartingPlayer, 1);
      addToBattleLog(`Player ${randomStartingPlayer} goes first!`);
      setGameStarted(true);
    }, 100);
  };

  const CharacterCardWithSkills = ({
    character,
    characterIndex,
    player,
    activePlayer,
    selectedCharacter,
    onCharacterSelect,
    onSkillSelect,
    onSkillUse,
    canUseSkill,
    cooldowns,
    playerChakra,
    selectedSkill,
  }) => {
    const isActive =
      selectedCharacter?.player === player &&
      selectedCharacter?.index === characterIndex;
    const isCurrentPlayerTurn = activePlayer === player;

    return (
      <div
        className={`character-card ${isActive ? "active" : ""} ${
          character.currentHealth === 0 ? "defeated" : ""
        }`}
        onClick={() => {
          if (
            selectedSkill &&
            activePlayer !== player &&
            character.currentHealth > 0
          ) {
            // If a skill is selected and this is an opponent's character, use skill on them
            onSkillUse(selectedSkill, player, characterIndex);
          } else {
            // Otherwise, select this character
            onCharacterSelect();
          }
        }}
        style={{
          border: `2px solid ${
            selectedSkill &&
            activePlayer !== player &&
            character.currentHealth > 0
              ? "#f59e0b"
              : isActive
              ? "#3b82f6"
              : character.currentHealth === 0
              ? "#6b7280"
              : "#d1d5db"
          }`,
          backgroundColor:
            character.currentHealth === 0 ? "#f3f4f6" : "#ffffff",
          borderRadius: "8px",
          padding: "16px",
          margin: "8px",
          cursor:
            selectedSkill &&
            activePlayer !== player &&
            character.currentHealth > 0
              ? "crosshair"
              : character.currentHealth === 0
              ? "default"
              : "pointer",
          opacity: character.currentHealth === 0 ? 0.6 : 1,
          position: "relative",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {character.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Heart size={16} style={{ color: "#ef4444" }} />
            <div
              style={{
                flex: 1,
                height: "8px",
                backgroundColor: "#e5e7eb",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#10b981",
                  width: `${
                    (character.currentHealth / character.health) * 100
                  }%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "medium" }}>
              {character.currentHealth}/{character.health}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {character.skills.map((skill) => {
            const playerCooldowns = cooldowns[`player${player}`];
            const skillKey = `${character.id}_${skill.id}`;
            const remainingCooldown = playerCooldowns[skillKey] || 0;
            const isOnCooldown = remainingCooldown > 0;
            const hasRequiredChakra = canUseSkill(skill, playerChakra);
            const isDisabled =
              !isCurrentPlayerTurn ||
              isOnCooldown ||
              !hasRequiredChakra ||
              character.currentHealth === 0;

            return (
              <button
                key={skill.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    onSkillSelect(skill);
                  }
                }}
                disabled={isDisabled}
                style={{
                  flex: "1",
                  minWidth: "0",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${
                    selectedSkill?.id === skill.id ? "#3b82f6" : "#d1d5db"
                  }`,
                  backgroundColor:
                    selectedSkill?.id === skill.id
                      ? "#dbeafe"
                      : isDisabled
                      ? "#f9fafb"
                      : "#ffffff",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled ? 0.6 : 1,
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: "medium",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {skill.name}
                </div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>
                  {skill.damage}dmg |{" "}
                  {skill.chakraReq
                    .map((req) => req.charAt(0).toUpperCase())
                    .join(",")}
                  {isOnCooldown && (
                    <span style={{ color: "#ef4444" }}>
                      |{remainingCooldown}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedSkill &&
          activePlayer !== player &&
          character.currentHealth > 0 && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                backgroundColor: "#f59e0b",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              TARGET
            </div>
          )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "24px",
        }}
      >
        Naruto Arena Engine
      </h1>

      {/* Game Info */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={20} />
            <span>Turn: {currentTurn}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={20} />
            <span>Active Player: {activePlayer || "Starting..."}</span>
          </div>
        </div>

        {/* Battle Log */}
        <div>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Battle Log:
          </h3>
          {battleLog.length === 0 ? (
            <p style={{ color: "#6b7280", fontStyle: "italic" }}>
              Battle will begin once you select an action...
            </p>
          ) : (
            <div style={{ maxHeight: "120px", overflowY: "auto" }}>
              {battleLog.slice(-5).map((log, index) => (
                <p key={index} style={{ margin: "4px 0", fontSize: "14px" }}>
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chakra Pools */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fef3c7",
            padding: "16px",
            borderRadius: "8px",
            border: "2px solid #f59e0b",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#92400e",
            }}
          >
            Player 1 Chakra ({countAliveCharacters(player1Team)} alive)
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "8px",
            }}
          >
            {Object.entries(player1Chakra).map(([type, amount]) => (
              <div
                key={type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 8px",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  borderRadius: "4px",
                }}
              >
                <span style={{ textTransform: "capitalize" }}>{type}:</span>
                <span style={{ fontWeight: "bold" }}>{amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#dbeafe",
            padding: "16px",
            borderRadius: "8px",
            border: "2px solid #3b82f6",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1e40af",
            }}
          >
            Player 2 Chakra ({countAliveCharacters(player2Team)} alive)
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "8px",
            }}
          >
            {Object.entries(player2Chakra).map(([type, amount]) => (
              <div
                key={type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 8px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "4px",
                }}
              >
                <span style={{ textTransform: "capitalize" }}>{type}:</span>
                <span style={{ fontWeight: "bold" }}>{amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* Player 1 Team */}
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#92400e",
              textAlign: "center",
            }}
          >
            Player 1 Team
          </h2>
          <div>
            {player1Team.map((character, index) => (
              <CharacterCardWithSkills
                key={`p1-${index}`}
                character={character}
                characterIndex={index}
                player={1}
                activePlayer={activePlayer}
                selectedCharacter={selectedCharacter}
                onCharacterSelect={() =>
                  setSelectedCharacter({ player: 1, index })
                }
                onSkillSelect={(skill) => setSelectedSkill(skill)}
                onSkillUse={handleSkillUse}
                canUseSkill={canUseSkill}
                cooldowns={cooldowns}
                playerChakra={player1Chakra}
                selectedSkill={selectedSkill}
              />
            ))}
          </div>
        </div>

        {/* Player 2 Team */}
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#1e40af",
              textAlign: "center",
            }}
          >
            Player 2 Team
          </h2>
          <div>
            {player2Team.map((character, index) => (
              <CharacterCardWithSkills
                key={`p2-${index}`}
                character={character}
                characterIndex={index}
                player={2}
                activePlayer={activePlayer}
                selectedCharacter={selectedCharacter}
                onCharacterSelect={() =>
                  setSelectedCharacter({ player: 2, index })
                }
                onSkillSelect={(skill) => setSelectedSkill(skill)}
                onSkillUse={handleSkillUse}
                canUseSkill={canUseSkill}
                cooldowns={cooldowns}
                playerChakra={player2Chakra}
                selectedSkill={selectedSkill}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Target Selection - now handled by clicking characters directly */}
      {selectedSkill && (
        <div
          style={{
            backgroundColor: "#f1f5f9",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "1px solid #cbd5e1",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>
            {selectedSkill.name} selected - Click on a character to target them!
          </h3>
          <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
            Damage: {selectedSkill.damage} | Chakra:{" "}
            {selectedSkill.chakraReq.join(", ")}
          </p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <button
          onClick={endTurn}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#10b981",
            color: "white",
            cursor: "pointer",
          }}
        >
          End Turn
        </button>
        <button
          onClick={resetGame}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            cursor: "pointer",
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default NarutoArenaEngine;
