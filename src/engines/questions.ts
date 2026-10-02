import type { CreatorProject } from '../domain/project';
import {
  matchesRule,
  questionPacks,
  type QuestionDefinition,
} from '../registries/questions';
export function activeQuestions(project: CreatorProject): QuestionDefinition[] {
  const questions = questionPacks.all().flatMap((pack) => pack.questions);
  const ids = new Set<string>();
  return questions.filter((question) => {
    if (ids.has(question.id))
      throw new Error(`Duplicate question: ${question.id}`);
    ids.add(question.id);
    return (question.rules ?? []).every((rule) => matchesRule(project, rule));
  });
}
export function questionProgress(project: CreatorProject): {
  done: number;
  total: number;
} {
  const questions = activeQuestions(project);
  return {
    done: questions.filter((q) => project.answers[q.id]).length,
    total: questions.length,
  };
}
