const FLASHCARD_REVIEW_KEY = "estudiosProFlashcardReviews";

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeContext(context = {}) {
  return {
    studentId: context.studentId || "",
    courseId: context.courseId || "",
    subjectId: context.subjectId || "",
    blockId: context.blockId || "",
  };
}

function sameContext(review, context) {
  const normalized = normalizeContext(context);
  return (
    review.studentId === normalized.studentId &&
    review.courseId === normalized.courseId &&
    review.subjectId === normalized.subjectId &&
    (review.blockId || "") === (normalized.blockId || "")
  );
}

export function getAllFlashcardReviews() {
  try {
    return JSON.parse(localStorage.getItem(FLASHCARD_REVIEW_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAllFlashcardReviews(reviews) {
  localStorage.setItem(FLASHCARD_REVIEW_KEY, JSON.stringify(reviews));
}

export function getReviewForFlashcard(flashcardId, context) {
  return getAllFlashcardReviews().find((review) => review.flashcardId === flashcardId && sameContext(review, context));
}

export function saveFlashcardReview(flashcard, context, result) {
  const normalized = normalizeContext(context);
  const reviews = getAllFlashcardReviews();
  const existingIndex = reviews.findIndex((review) => review.flashcardId === flashcard.id && sameContext(review, normalized));
  const previous = existingIndex >= 0 ? reviews[existingIndex] : null;
  const nextReview = {
    id: previous?.id || createId(),
    flashcardId: flashcard.id,
    ...normalized,
    result,
    reviewCount: (previous?.reviewCount || 0) + 1,
    lastReviewedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    reviews[existingIndex] = nextReview;
  } else {
    reviews.push(nextReview);
  }

  saveAllFlashcardReviews(reviews);
  return nextReview;
}

export function getReviewStats(flashcards, context) {
  return flashcards.reduce(
    (stats, flashcard) => {
      const review = getReviewForFlashcard(flashcard.id, context);
      if (!review) return stats;
      stats[review.result] = (stats[review.result] || 0) + 1;
      return stats;
    },
    { known: 0, doubt: 0, unknown: 0 }
  );
}
