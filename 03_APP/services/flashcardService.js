export function createFlashcardsForArea({ area, studyData }) {
  return studyData.flashcards.map(([front, back]) => createFlashcard({ area, front, back }));
}

export function createFlashcard({ area, front, back }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${front}`,
    front,
    back,
    area,
    status: "nueva",
    createdAt: new Date().toISOString(),
  };
}

export function limitFlashcards(cards, maxCards = 20) {
  return cards.slice(0, maxCards);
}
