import { useEffect, useRef } from "react";

import { OTP_LENGTH } from "../../utils/authHelpers";

// One-time-password input rendered as separate digit boxes. The parent still
// sees a single string — onChange is called with the same { target: { name,
// value } } shape the old single-field version used, so callers are unchanged.
export default function OtpInput({
  name = "otp",
  value = "",
  onChange,
  label = "Verification code",
  error,
  hint,
  disabled = false,
  required = true,
  autoFocus = false,
}) {
  const boxesRef = useRef([]);
  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => value[index] ?? "",
  );
  const firstEmpty = digits.findIndex((digit) => digit === "");

  useEffect(() => {
    if (autoFocus) boxesRef.current[0]?.focus();
  }, [autoFocus]);

  // Always emit a left-aligned string so the boxes stay in sync with `value`.
  const emit = (nextDigits) => {
    onChange({ target: { name, value: nextDigits.join("") } });
  };

  const focusBox = (index) => {
    const box = boxesRef.current[index];
    box?.focus();
    box?.select();
  };

  const handleChange = (index) => (event) => {
    const typed = event.target.value.replace(/\D/g, "");

    if (!typed) {
      // The box was cleared — reflect that and stop.
      const next = digits.slice();
      next[index] = "";
      emit(next);
      return;
    }

    const next = digits.slice();

    // Filling one box moves to the next; pasting several fills several.
    for (
      let offset = 0;
      offset < typed.length && index + offset < OTP_LENGTH;
      offset += 1
    ) {
      next[index + offset] = typed[offset];
    }

    emit(next);
    focusBox(Math.min(index + typed.length, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      const next = digits.slice();

      if (next[index]) {
        // Clear the current box first.
        next[index] = "";
        emit(next);
      } else if (index > 0) {
        // Already empty: step back and clear that one.
        next[index - 1] = "";
        emit(next);
        focusBox(index - 1);
      }

      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusBox(index - 1);
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index) => (event) => {
    const pasted = (event.clipboardData?.getData("text") ?? "").replace(
      /\D/g,
      "",
    );

    if (!pasted) return;

    event.preventDefault();

    const next = digits.slice();

    for (
      let offset = 0;
      offset < pasted.length && index + offset < OTP_LENGTH;
      offset += 1
    ) {
      next[index + offset] = pasted[offset];
    }

    emit(next);
    focusBox(Math.min(index + pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={`${name}-0`}
          className="text-sm font-medium text-primary"
        >
          {label}
          {required && <span className="text-accent"> *</span>}
        </label>
      )}

      {/* Fixed-width boxes that keep their shape in any card: stretching six
          boxes across a wide panel turned them into huge empty tiles. */}
      <div
        role="group"
        aria-label={`${OTP_LENGTH}-digit ${label?.toLowerCase() ?? "code"}`}
        className="flex items-center gap-2 sm:gap-2.5"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            id={`${name}-${index}`}
            ref={(element) => {
              boxesRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={OTP_LENGTH}
            value={digit}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste(index)}
            onFocus={(event) => event.target.select()}
            disabled={disabled}
            required={required && index === 0}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            aria-invalid={Boolean(error)}
            className={[
              "h-12 w-10 shrink-0 rounded-xl border bg-white text-center text-lg font-semibold text-primary",
              "outline-none transition-all duration-200 sm:h-14 sm:w-12 sm:text-xl",
              "focus:ring-4 disabled:cursor-not-allowed disabled:bg-peach/30",
              error
                ? "border-red-400 focus:ring-red-100"
                : digit
                  ? "border-accent/60 bg-peach/20 focus:border-accent focus:ring-accent/15"
                  : "border-border focus:border-accent focus:ring-accent/15",
            ].join(" ")}
          />
        ))}
      </div>

      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${name}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}

      {!error && !hint && firstEmpty >= 0 && (
        <p id={`${name}-hint`} className="text-xs text-muted">
          Enter all {OTP_LENGTH} digits to continue.
        </p>
      )}
    </div>
  );
}
