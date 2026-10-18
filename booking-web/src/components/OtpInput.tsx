import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Minus } from 'lucide-react';

export default function OtpInput({ length = 5, onComplete }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);
  const submitRef = useRef(null);

  const handleChange = (e, index) => {
    const val = e.target.value;
    
    // Only allow single digits
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // If a digit was entered, move forward
    if (val) {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        submitRef.current?.focus();
        onComplete?.(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Block non-digit keys except navigation/shortcuts
    if (
      !/^[0-9]$/.test(e.key) &&
      !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
      !e.metaKey &&
      !e.ctrlKey
    ) {
      e.preventDefault();
    }

    // Handle Backspace / Delete
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current box if it has a value
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Otherwise, move back and clear the previous box
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Check if the pasted string consists exactly of `length` digits
    if (!new RegExp(`^[0-9]{${length}}$`).test(pastedData)) {
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    submitRef.current?.focus();
    onComplete?.(pastedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length === length) {
      console.log('OTP Submitted:', fullOtp);
      // Trigger your API verification call here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-1 items-center">
      {otp.map((digit, index) => (<>
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={handleFocus}
          onPaste={handlePaste}
          className="h-11 w-11 px-1 text-center text-3xl border-1 border-muted-foreground"
        />
        {index == 1 && <div key="s"><Minus /></div>}
        </>
      ))}
      <button ref={submitRef} type="submit">
        Submit
      </button>
    </form>
  );
}