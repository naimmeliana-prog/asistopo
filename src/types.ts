export interface UserProfile {
  username: string;
  oppositionId: string;
  academicTitle: string;
  studyHoursGoal: number; // Hours per week
  disabilityQuota: boolean;
  region: string;
}

export interface OppositionDescriptiveCard {
  vacancies: number;
  scale: string;
  deadline: string;
  referenceBOE: string;
  officialLink: string;
  place: string;
  examType: string;
  minDegree: string;
  legislativeWarning: string;
}

export interface SyllabusBlock {
  id: string;
  title: string;
  weight: number; // Percent weight in examinations
  topics: {
    id: string;
    title: string;
    articles: string[]; // Legal references
    content: string; // Navigable text summary
  }[];
}

export interface OfficialExam {
  year: number;
  location: string;
  pdfUrl?: string;
  questionsCount: number;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    justification: string;
  }[];
}

export interface PracticalCase {
  id: string;
  title: string;
  year: number;
  situation: string;
  questions: {
    question: string;
    legalBase: string;
    solution: string;
  }[];
}

export interface OppositionData {
  id: string;
  name: string;
  shortName: string;
  group: string; // A1, A2, C1, C2
  adminType: "Estatal" | "Autonómica" | "Local" | "Universitaria";
  region: string;
  province?: string;
  status: "Abierto" | "Cerrado" | "Próxima Convocatoria";
  generalRequirements: string[];
  tribunalQualities: string[];
  card: OppositionDescriptiveCard;
  syllabus: SyllabusBlock[];
  officialExams: OfficialExam[];
  practicalCases: PracticalCase[];
}

export interface StudyPlan {
  weeklyHoursRecommended: number;
  focusStrategy: string;
  weeklyTasks: {
    day: string;
    topic: string;
    activity: string;
    duration: string;
    priority: "Alta" | "Media" | "Baja";
  }[];
  personalizedAdvice: string[];
  milestones: {
    name: string;
    targetDate: string;
    description: string;
  }[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: "general" | "auxilio" | "tramitacion" | "tecnicas" | "boe";
  likes: number;
  replies: {
    author: string;
    content: string;
    date: string;
  }[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  box: number; // Leitner box (1 to 5)
  nextReviewDate: string;
}

export interface UserProgress {
  selectedOppositionId: string;
  studyTimeSeconds: number;
  completedTestsCount: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  completedFlashcards: string[]; // flashcard IDs
  unlockedBadges: string[];
  studyStreakDays: number;
  lastStudyDate: string;
  testHistory: {
    date: string;
    oppositionName: string;
    score: number;
    total: number;
    correct: number;
    timeSeconds: number;
    isSimulacro: boolean;
  }[];
  completedTopics?: string[];
  reviewTopics?: string[];
}
