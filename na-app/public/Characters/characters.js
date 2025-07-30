const characters = {
  uzumakiNaruto: {
    id: "naruto",
    name: "Uzumaki Naruto",
    health: 100,
    image: "https://imgur.com/MCUbyOu.png",
    description:
      "A genin from team 7, Naruto is an orphan with the goal to one day become Hokage. Using his signature move, Shadow Clones, Naruto is able to perform powerful moves such as the Uzumake Naruto Combo an the Rasengan.",
    skills: [
      {
        id: "uzumakiNarutoCombo",
        name: "Uzumaki Naruto Combo",
        damage: 20,
        chakraReq: ["taijutsu"],
        cooldown: 0,
        type: "Physical",
        classes: ["physical", "melee", "instant"],
        description:
          "Naruto's version of the lion combo. This skill deals 20 damage to one enemy. During Shadow Clones, this skill will deal 10 additional damage.",
        image: "https://i.imgur.com/Uy1TKG3.png",
      },
      {
        id: "rasengan",
        name: "Rasengan",
        damage: 30,
        chakraReq: ["ninjutssu", "random"],
        cooldown: 1,
        type: "Chakra",
        classes: ["chakra", "melee", "instant"],
        description:
          "Naruto hits one enemy with a ball of chakra, dealing 45 damage to them and stunning their skills for 1 turn. Requires Shadow Clones to be active",
        image: "https://i.imgur.com/v9ugaAD.png",
      },
      {
        id: "shadowClone",
        name: "Shadow Clone Jutsu",
        damage: 0,
        chakraReq: ["random"],
        cooldown: 3,
        type: "Chakra",
        classes: ["chakra", "instant"],
        description:
          "Naruto creates multiple shadow clones hiding his true self. Naruto gains 15 points of damage reduction for 4 turns. During this time, Uzumaki Naruto Combo is improved and will deal an additional 10 damage and Rasengan may be used.",
        image: "https://i.imgur.com/98c5RRL.png",
      },
    ],
  },
  harunoSakura: {
    id: "sakura",
    name: "Haruno Sakura",
    health: 85,
    image: "https://i.imgur.com/TWShCf2.png",
    description:
      "A genin from team 7, Sakura is very intelligent, but self-conscious about herself. Having just recently received training from Tsunade, Sakura is now able to deliver powerful punches and heal her own allies.",
    skills: [
      {
        id: "koPunch",
        name: "KO Punch",
        damage: 20,
        chakraReq: ["taijutsu"],
        cooldown: 0,
        type: "Physical",
        classes: ["physical", "melee", "instant"],
        description:
          "Sakura punches one enemy with all of her strength, dealing 20 damage to them and stunning their physical and mental skills for 1 turn. During Inner Sakura, this skill will deal 10 additional damage.",
        image: "https://i.imgur.com/x0Yqker.png",
      },
      {
        id: "cure",
        name: "Cure",
        damage: -25,
        chakraReq: ["ninjutsu"],
        cooldown: 0,
        type: "Mental",
        effect: "heal",
        classes: ["chakra", "melee", "instant"],
        description:
          "Using basic healing techniques, Sakura heals herself or an ally for 25 health.",
        image: "https://i.imgur.com/M2O5AdG.png",
      },
      {
        id: "innerSakura",
        name: "Inner Sakura",
        damage: 0,
        chakraReq: ["random"],
        cooldown: 4,
        type: "Mental",
        classes: ["mental", "instant", "unique"],
        description:
          "Sakura's inner self surfaces and urges her on. For 4 turns, Sakura will gain 10 points of damage reduction. During this time, Sakura will ignore non-damage effects and KO Punch will deal 10 additional damage.",
        image: "https://i.imgur.com/03BjSkn.jpg",
      },
    ],
  },
  uchihaSasuke: {
    id: "sasuke",
    name: "Uchiha Sasuke",
    health: 95,
    image: "https://i.imgur.com/teixXT7.png",
    description:
      "A genin from team 7, Sasuke is the lone survivor of the Uchiha clan and has sworn vengeance against his brother. Using his Sharingan, Sasuke is able to anticipate incoming attacks and is capable of advanced offensive moves.",
    skills: [
      {
        id: "lionCombo",
        name: "Lion Combo",
        damage: 30,
        chakraReq: ["taijutsu", "random"],
        cooldown: 0,
        type: "Physical",
        classes: ["physical", "melee", "instant"],
        description:
          "Copying a Taijutsu that lee used on him, Sasuke deals 30 damage to one enemy. This skill will deal an additional 15 damage to an enemy affected by Sharingan.",
        image: "https://i.imgur.com/tEIH5fQ.png",
      },
      {
        id: "chidori",
        name: "Chidori",
        damage: 40,
        chakraReq: ["ninjutsu", "random"],
        cooldown: 1,
        type: "Chakra",
        classes: ["chakra", "melee", "instant"],
        description:
          "Using a lightning element attack jutsu, Sasuke deals 40 piercing damage to one enemy. This skill will deal an additional 15 damage to an enemy affected by Sharingan. Requires Sharingan to be active on Sasuke.",
        image: "https://i.imgur.com/kQpuuuX.png",
      },
      {
        id: "sharingan",
        name: "Sharingan",
        damage: 0,
        chakraReq: [],
        cooldown: 3,
        type: "Mental",
        effect: "counter",
        classes: ["mental", "ranged", "instant", "unique"],
        description:
          "Sasuke targets one enemy. For 4 turns, Sasuke will gain 25% damage reduction and Chidori may be used. During this time, that enemy will recieve an additional 15 damage from Lion Combo and Chidori.",
        image: "https://i.imgur.com/Sv53VXt.png",
      },
    ],
  },
};

export default characters;
