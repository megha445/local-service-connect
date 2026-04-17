import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardDetails {
  cardNumber: string; // formatted with spaces
  expiry: string;    // MM/YY
  cvc: string;
}

export interface CardErrors {
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
}

export function validateCard(card: CardDetails): CardErrors {
  const errors: CardErrors = {};
  const digits = card.cardNumber.replace(/\s+/g, "");

  if (!digits) errors.cardNumber = "Card number is required";
  else if (!/^\d+$/.test(digits)) errors.cardNumber = "Only digits allowed";
  else if (digits.length < 16) errors.cardNumber = "Must be at least 16 digits";
  else if (digits.length > 19) errors.cardNumber = "Too many digits";

  if (!card.expiry) errors.expiry = "Expiry is required";
  else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) errors.expiry = "Use MM/YY format";
  else {
    const [mm, yy] = card.expiry.split("/").map(Number);
    const now = new Date();
    const expDate = new Date(2000 + yy, mm); // first day of month after expiry
    if (expDate <= new Date(now.getFullYear(), now.getMonth(), 1)) {
      errors.expiry = "Card has expired";
    }
  }

  if (!card.cvc) errors.cvc = "CVC is required";
  else if (!/^\d{3}$/.test(card.cvc)) errors.cvc = "CVC must be 3 digits";

  return errors;
}

export function isCardValid(card: CardDetails): boolean {
  return Object.keys(validateCard(card)).length === 0;
}

const formatCardNumber = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

interface Props {
  card: CardDetails;
  onChange: (card: CardDetails) => void;
}

export default function PaymentCardForm({ card, onChange }: Props) {
  const errors = useMemo(() => validateCard(card), [card]);
  const showError = (field: keyof CardErrors) =>
    card[field].length > 0 && errors[field];

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CreditCard className="h-4 w-4" /> Card Details (Test Mode)
      </div>

      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={card.cardNumber}
          onChange={(e) => onChange({ ...card, cardNumber: formatCardNumber(e.target.value) })}
          className={cn(showError("cardNumber") && "border-destructive focus-visible:ring-destructive")}
          maxLength={23}
        />
        {showError("cardNumber") && (
          <p className="mt-1 text-xs text-destructive">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="expiry">Expiry (MM/YY)</Label>
          <Input
            id="expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={card.expiry}
            onChange={(e) => onChange({ ...card, expiry: formatExpiry(e.target.value) })}
            className={cn(showError("expiry") && "border-destructive focus-visible:ring-destructive")}
            maxLength={5}
          />
          {showError("expiry") && (
            <p className="mt-1 text-xs text-destructive">{errors.expiry}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={card.cvc}
            onChange={(e) => onChange({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })}
            className={cn(showError("cvc") && "border-destructive focus-visible:ring-destructive")}
            maxLength={3}
          />
          {showError("cvc") && (
            <p className="mt-1 text-xs text-destructive">{errors.cvc}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        🔒 Test mode — card details are validated locally and never stored or sent to a server.
      </p>
    </div>
  );
}
