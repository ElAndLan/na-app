import React from "react";
import Image from "next/image";
import { Sword, Shield, Zap, Heart, Clock } from "lucide-react";
import styles from "../../page.module.css";

const CharacterCard = ({
  character,
  characterIndex,
  player,
  activePlayer,
  selectedCharacter,
  selectedSkill,
  onCharacterSelect,
  onSkillSelect,
  canUseSkill,
  cooldowns,
  playerChakra,
  isTargetable,
}) => {
  const isSelected =
    selectedCharacter?.player === player &&
    selectedCharacter?.index === characterIndex;
  const isActivePlayerCharacter = player === activePlayer;
  const isDefeated = character.currentHealth <= 0;
  const playerCooldowns = cooldowns[`player${player}`] || {};

  const getSkillIcon = (skillType) => {
    switch (skillType) {
      case "Physical":
        return <Sword size={16} />;
      case "Mental":
        return <Shield size={16} />;
      case "Chakra":
        return <Zap size={16} />;
      default:
        return <Heart size={16} />;
    }
  };

  const canUseThisSkill = (skill) => {
    const skillKey = `${character.id}_${skill.id}`;
    const onCooldown =
      playerCooldowns[skillKey] && playerCooldowns[skillKey] > 0;
    return !onCooldown && canUseSkill(skill, playerChakra);
  };

  const getSkillCooldown = (skill) => {
    const skillKey = `${character.id}_${skill.id}`;
    return playerCooldowns[skillKey] || 0;
  };

  const handleCardClick = () => {
    if (character.currentHealth <= 0) return;
    onCharacterSelect(player, characterIndex);
  };

  // Get placeholder image based on character
  const getCharacterImage = () => {
    const placeholders = {
      naruto: "https://imgur.com/MCUbyOu.png",
      sasuke: "https://i.imgur.com/TWShCf2.png",
      sakura: "https://i.imgur.com/teixXT7.png",
    };
    return (
      placeholders[character.id] ||
      "https://via.placeholder.com/80x80/6B7280/FFFFFF?text=?"
    );
  };

  return (
    <div
      className={`${styles.characterCard} ${
        isSelected ? styles.characterCardSelected : ""
      } ${isTargetable ? styles.characterCardTargetable : ""} ${
        isDefeated ? styles.characterCardDefeated : ""
      }`}
      onClick={handleCardClick}
    >
      <div className={styles.characterLayout}>
        {/* Left side: Character image and health */}
        <div className={styles.characterImageSection}>
          <Image
            src={getCharacterImage()}
            alt={character.name}
            width={80}
            height={80}
            className={styles.characterImage}
            unoptimized
          />
          {/* Character name overlay */}
          <div className={styles.characterNameOverlay}>{character.name}</div>
        </div>

        {/* Health bar below image */}
        <div className={styles.healthBarContainer}>
          <div
            className={styles.healthBar}
            style={{
              background: `linear-gradient(to right, #22c55e ${
                (character.currentHealth / character.health) * 100
              }%, #e5e7eb ${
                (character.currentHealth / character.health) * 100
              }%)`,
            }}
          >
            <span className={styles.healthText}>
              {character.currentHealth}/{character.health}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Skills */}
      <div className={styles.skillsSection}>
        {character.skills.map((skill) => {
          const skillCooldown = getSkillCooldown(skill);
          const skillUsable = canUseThisSkill(skill);
          const isSkillSelected = selectedSkill?.id === skill.id && isSelected;

          return (
            <div
              key={skill.id}
              className={`${styles.skillSquare} ${
                !skillUsable ? styles.skillSquareDisabled : ""
              } ${isSkillSelected ? styles.skillSquareSelected : ""} ${
                !isActivePlayerCharacter ? styles.skillSquareInactive : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isActivePlayerCharacter && skillUsable) {
                  onSkillSelect(skill);
                }
              }}
              title={`${skill.name} - ${
                skill.damage > 0
                  ? `${skill.damage} DMG`
                  : skill.damage < 0
                  ? `${Math.abs(skill.damage)} HP`
                  : "Special"
              } | Chakra: ${skill.chakraReq.join(", ")} | Cooldown: ${
                skill.cooldown
              }${skillCooldown > 0 ? ` (${skillCooldown} turns left)` : ""}`}
            >
              <div className={styles.skillIcon}>{getSkillIcon(skill.type)}</div>
              {skillCooldown > 0 && (
                <div className={styles.skillCooldownOverlay}>
                  {skillCooldown}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterCard;
