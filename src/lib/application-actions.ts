export function canWithdrawApplication(status: string): boolean {
  return status === "pending";
}

export function postRequiresSkill(requiredSkills: string[], selectedSkill: string): boolean {
  if (!selectedSkill) return true;
  return requiredSkills.some((skill) => skill.toLowerCase() === selectedSkill.toLowerCase());
}