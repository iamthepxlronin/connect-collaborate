export function canWithdrawApplication(status: string): boolean {
  return status === "pending";
}