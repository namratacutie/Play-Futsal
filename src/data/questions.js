// Romantic questions and rewards data
export const questionsForNammu = [
    {
        id: 1,
        question: "I want to spend the rest of my life with you. Will you be part of it? 💕",
        options: ["Yes, absolutely! 💖", "Let me think about it 🤔", "Ask me again later 😊"],
        reward: "You just unlocked a lifetime of adventure together! 🎉",
        points: 100
    },
    {
        id: 2,
        question: "If we were the last two people on Earth, would you still choose me? 🌍💑",
        options: ["I'd choose you in every universe! 💫", "Only if you make me food 🍕", "You're my first choice always ❤️"],
        reward: "Your love transcends dimensions! 🌌",
        points: 80
    },
    {
        id: 3,
        question: "Can we watch the sunset together every day? 🌅",
        options: ["Every sunset is ours 🧡", "Only if you hold my hand 🤝", "I'll bring the snacks! 🍿"],
        reward: "1000 sunsets unlocked! Each one with you ☀️",
        points: 75
    },
    {
        id: 4,
        question: "Will you be my player 2 forever? 🎮❤️",
        options: ["Game on, forever! 🕹️", "Only if we never lose 😄", "I'll always have your back! 💪"],
        reward: "Co-op mode: ETERNAL unlocked! 🎮",
        points: 90
    },
    {
        id: 5,
        question: "Do you believe we were meant to find each other? ✨",
        options: ["It was written in the stars ⭐", "Destiny brought us together 💖", "You're my favorite coincidence 🎯"],
        reward: "Fate smiles upon your love! 🌟",
        points: 85
    },
    {
        id: 6,
        question: "Would you travel the world with me? 🗺️",
        options: ["Adventure awaits us! ✈️", "Home is wherever you are 🏠", "Let's go everywhere together! 🌎"],
        reward: "World tour for two unlocked! 🎫",
        points: 70
    },
    {
        id: 7,
        question: "Will you still love me when I'm old and grey? 👴👵",
        options: ["Forever and always 💕", "You'll only get more handsome 😏", "Growing old with you is my dream 💭"],
        reward: "Eternal love achievement! 💎",
        points: 100
    }
];

export const questionsForSuprem = [
    {
        id: 1,
        question: "Would you hold my hand even when it's sweaty? 😄",
        options: ["Every single time! 🤝", "That's what love is! 💦", "I'll hold both hands! ✋✋"],
        reward: "Hand-holding level: Expert! 🏆",
        points: 60
    },
    {
        id: 2,
        question: "Can I be the one who makes you laugh every day? 😂",
        options: ["You already do! 🤣", "My favorite comedian 🎭", "Keep the jokes coming! 📢"],
        reward: "Chief Happiness Officer appointed! 😊",
        points: 70
    },
    {
        id: 3,
        question: "Will you still like me even if I burn your food? 🍳💀",
        options: ["I'll eat anything you make! 🍽️", "Let's order pizza instead 🍕", "Cooking lessons for both of us! 👨‍🍳"],
        reward: "Love > Cooking Skills unlocked! 💝",
        points: 55
    },
    {
        id: 4,
        question: "Do you think our love can score more goals than this game? ⚽💖",
        options: ["Infinite goals ahead! ⚽⚽⚽", "We're the dream team! 🏆", "Every moment with you is a goal! 🥅"],
        reward: "Hat-trick of love achieved! ⚽⚽⚽❤️",
        points: 80
    },
    {
        id: 5,
        question: "Will you dance with me even if there's no music? 💃🕺",
        options: ["Our hearts make the music 🎵", "Dancing anywhere with you! 🌟", "You're my favorite rhythm 🥁"],
        reward: "Dance partner for life! 💫",
        points: 75
    },
    {
        id: 6,
        question: "Can I steal your hoodies forever? 👕",
        options: ["They look better on you! 😍", "Only fair trade for my heart 💕", "What's mine is yours! 🤝"],
        reward: "Wardrobe sharing: Activated! 👔",
        points: 50
    },
    {
        id: 7,
        question: "Will you be my biggest fan no matter what? 📣",
        options: ["Your #1 supporter always! 🏅", "Front row at everything! 🎫", "Cheering you on forever! 📢"],
        reward: "Fan club president badge earned! 🎖️",
        points: 65
    }
];

export const getRandomQuestion = (forPlayer) => {
    const questions = forPlayer === 'Nammu' ? questionsForNammu : questionsForSuprem;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
};
