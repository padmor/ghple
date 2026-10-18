/**
 * Turn the bank or network's code into something a customer understands.
 * The original wording is still saved in the order log for the manager.
 */
export function friendlyReason(raw: string | undefined | null): string {
  const r = (raw ?? "").toUpperCase();

  if (/LOW_BALANCE|INSUFFICIENT|NOT_ENOUGH|NOT ENOUGH/.test(r))
    return "Your MoMo wallet may not have enough balance (or a limit was reached). Please top up or try another number.";
  if (/PIN/.test(r) && /WRONG|INVALID|INCORRECT/.test(r)) return "The MoMo PIN was wrong. Please try again.";
  if (/REJECT|DECLINE|CANCEL/.test(r)) return "The payment was declined on your phone.";
  if (/TIMEOUT|TIMED|EXPIRE|NOT COMPLETED|ABANDON/.test(r)) return "We did not receive your approval in time. Please send the prompt again.";
  if (/LIMIT/.test(r)) return "A transaction limit was reached on this wallet. Please try another number or a smaller amount.";
  if (/NOT_ALLOWED|NOT ALLOWED|INACTIVE|BLOCK/.test(r)) return "This number cannot make the payment. Please try another number.";
  return "The payment was not completed. Please try again or use another number.";
}
