import { useState, useEffect } from 'react';
import { Pack, GameState } from './types';

const PACKS_KEY = 'quiz.packs';
const GAME_STATE_KEY = 'quiz.gameState';

const SEED_PACK: Pack = {
  id: 'seed-1',
  name: 'الباقة الكلاسيكية',
  questions: [
    // التاريخ
    { id: 'q1', category: 'تاريخ', points: 100, text: 'من هو مؤسس الدولة الأموية؟', answer: 'معاوية بن أبي سفيان' },
    { id: 'q2', category: 'تاريخ', points: 200, text: 'في أي عام هجري وقعت غزوة بدر؟', answer: 'العام الثاني للهجرة' },
    { id: 'q3', category: 'تاريخ', points: 300, text: 'ما هي عاصمة الخلافة العباسية؟', answer: 'دمشق ثم بغداد' },
    { id: 'q4', category: 'تاريخ', points: 400, text: 'من القائد المسلم الذي فتح الأندلس؟', answer: 'طارق بن زياد' },
    { id: 'q5', category: 'تاريخ', points: 500, text: 'ما هو الاسم الحقيقي لصلاح الدين الأيوبي؟', answer: 'يوسف بن أيوب' },
    { id: 'q6', category: 'تاريخ', points: 600, text: 'متى سقطت غرناطة؟', answer: '1492 م' },
    // جغرافيا
    { id: 'q7', category: 'جغرافيا', points: 100, text: 'ما هي عاصمة المملكة العربية السعودية؟', answer: 'الرياض' },
    { id: 'q8', category: 'جغرافيا', points: 200, text: 'أين يقع جبل إيفرست؟', answer: 'بين نيبال والصين' },
    { id: 'q9', category: 'جغرافيا', points: 300, text: 'ما هو أطول نهر في العالم؟', answer: 'نهر النيل' },
    { id: 'q10', category: 'جغرافيا', points: 400, text: 'ما هي أكبر قارة في العالم من حيث المساحة؟', answer: 'آسيا' },
    { id: 'q11', category: 'جغرافيا', points: 500, text: 'ما هو المحيط الذي يقع بين أمريكا وأوروبا؟', answer: 'المحيط الأطلسي' },
    { id: 'q12', category: 'جغرافيا', points: 600, text: 'ما هي الدولة التي تتكون من أكثر من 17 ألف جزيرة؟', answer: 'إندونيسيا' },
    // علوم
    { id: 'q13', category: 'علوم', points: 100, text: 'ما هو الغاز الذي يتنفسه الإنسان؟', answer: 'الأكسجين' },
    { id: 'q14', category: 'علوم', points: 200, text: 'ما هي سرعة الضوء؟', answer: '300,000 كم/ثانية تقريباً' },
    { id: 'q15', category: 'علوم', points: 300, text: 'من هو مخترع المصباح الكهربائي؟', answer: 'توماس إديسون' },
    { id: 'q16', category: 'علوم', points: 400, text: 'ما هو العضو الذي يضخ الدم في جسم الإنسان؟', answer: 'القلب' },
    { id: 'q17', category: 'علوم', points: 500, text: 'ما هو أقرب كوكب للشمس؟', answer: 'عطارد' },
    { id: 'q18', category: 'علوم', points: 600, text: 'ما هو الرمز الكيميائي للذهب؟', answer: 'Au' },
    // رياضة
    { id: 'q19', category: 'رياضة', points: 100, text: 'كم عدد لاعبي فريق كرة القدم؟', answer: '11 لاعب' },
    { id: 'q20', category: 'رياضة', points: 200, text: 'في أي دولة أقيمت أول بطولة لكأس العالم؟', answer: 'أوروغواي' },
    { id: 'q21', category: 'رياضة', points: 300, text: 'من هو اللاعب الملقب بالجوهرة السوداء؟', answer: 'بيليه' },
    { id: 'q22', category: 'رياضة', points: 400, text: 'ما هي الرياضة التي تستخدم فيها كرة بيضاوية الشكل؟', answer: 'الرجبي / كرة القدم الأمريكية' },
    { id: 'q23', category: 'رياضة', points: 500, text: 'كم تستمر مباراة كرة السلة؟', answer: '40 دقيقة (مقسمة على 4 أرباع)' },
    { id: 'q24', category: 'رياضة', points: 600, text: 'ما هو طول سباق الماراثون؟', answer: '42.195 كيلومتر' },
    // ثقافة عامة
    { id: 'q25', category: 'ثقافة عامة', points: 100, text: 'ما هي لغة القرآن الكريم؟', answer: 'اللغة العربية' },
    { id: 'q26', category: 'ثقافة عامة', points: 200, text: 'من هو مؤلف كتاب البخلاء؟', answer: 'الجاحظ' },
    { id: 'q27', category: 'ثقافة عامة', points: 300, text: 'ما هو الطائر الذي لا يطير؟', answer: 'النعامة / البطريق' },
    { id: 'q28', category: 'ثقافة عامة', points: 400, text: 'ما هو الحيوان الذي يُسمى بسفينة الصحراء؟', answer: 'الجمل' },
    { id: 'q29', category: 'ثقافة عامة', points: 500, text: 'ما هو اللون الذي يرمز للسلام؟', answer: 'الأبيض' },
    { id: 'q30', category: 'ثقافة عامة', points: 600, text: 'من هو أول من صعد إلى الفضاء؟', answer: 'يوري غاغارين' },
  ]
};

export function getStoredPacks(): Pack[] {
  try {
    const data = localStorage.getItem(PACKS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return [SEED_PACK];
}

export function saveStoredPacks(packs: Pack[]) {
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
}

export function getStoredGameState(): GameState | null {
  try {
    const data = localStorage.getItem(GAME_STATE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function saveStoredGameState(state: GameState) {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function usePacks() {
  const [packs, setPacksState] = useState<Pack[]>(getStoredPacks());

  const setPacks = (newPacks: Pack[] | ((prev: Pack[]) => Pack[])) => {
    setPacksState((prev) => {
      const next = typeof newPacks === 'function' ? newPacks(prev) : newPacks;
      saveStoredPacks(next);
      return next;
    });
  };

  return { packs, setPacks };
}

export function useGameState() {
  const [gameState, setGameStateState] = useState<GameState | null>(getStoredGameState());

  const setGameState = (newState: GameState | null | ((prev: GameState | null) => GameState | null)) => {
    setGameStateState((prev) => {
      const next = typeof newState === 'function' ? newState(prev) : newState;
      if (next) {
        saveStoredGameState(next);
      } else {
        localStorage.removeItem(GAME_STATE_KEY);
      }
      return next;
    });
  };

  return { gameState, setGameState };
}
