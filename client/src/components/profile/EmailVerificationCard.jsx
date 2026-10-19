import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeCheck, Mail, MailCheck } from 'lucide-react';

import Button from '../common/Button';
import OtpInput from '../auth/OtpInput';
import StatusPill from '../dashboard/StatusPill';
import {
  clearAuthError,
  clearAuthMessage,
  resendVerificationCode,
  updateSessionUser,
  verifyEmailOtp,
} from '../../slices/authSlice';
import {
  OTP_EXPIRES_IN_MINUTES,
  OTP_LENGTH,
  isOtp,
} from '../../utils/authHelpers';
import { useToast } from '../notifications';

// Optional email verification for a signed-in account.
//
// Signing in no longer depends on this step, so it lives here instead of in the
// login flow: the address comes from the session, POST /auth/resend-verification
// mails a fresh code and POST /auth/verify-email consumes it. On success the
// session user is patched in Redux/localStorage so the badge flips immediately.
//
// Laid out like the change-password card next to it: what the section is about
// sits in a narrow rail, and the code boxes and their buttons keep a comfortable
// width instead of stretching across the whole card.
export default function EmailVerificationCard() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState('');

  const toast = useToast();

  const email = user?.email ?? '';
  const isVerified = Boolean(user?.emailVerified);

  const handleSendCode = async () => {
    dispatch(clearAuthError());
    dispatch(clearAuthMessage());
    setFieldError('');

    try {
      await dispatch(resendVerificationCode(email)).unwrap();
      toast.success(`A fresh ${OTP_LENGTH}-digit code is on its way to ${email}.`);
    } catch (failure) {
      toast.error(String(failure));
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearAuthMessage());

    if (!isOtp(otp)) {
      setFieldError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setFieldError('');

    try {
      await dispatch(verifyEmailOtp({ email, otp })).unwrap();
      dispatch(updateSessionUser({ emailVerified: true }));
      setOtp('');
      toast.success('Email verified. Thank you.');
    } catch (failure) {
      toast.error(String(failure));
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
        {/* Rail: what this section is for */}
        <div className="flex flex-col items-start gap-4">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-peach/30 text-accent">
            <MailCheck size={20} strokeWidth={1.7} aria-hidden="true" />
          </span>

          <div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-primary">
              Email verification
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Confirming your address is optional — you can do it any time from
              here.
            </p>
          </div>

          <StatusPill
            value={isVerified ? 'verified' : 'unverified'}
            label={isVerified ? 'email verified' : 'email not verified'}
            tone={isVerified ? 'success' : 'warning'}
          />
        </div>

        {/* The address, then the code and its actions */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <Mail size={16} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-accent" />
              <span className="truncate text-sm font-medium text-primary">
                {email || 'No email on this account'}
              </span>
            </span>

            {isVerified ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <BadgeCheck size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
                Verified
              </span>
            ) : (
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Not verified
              </span>
            )}
          </div>

          {isVerified ? (
            <p className="text-xs leading-5 text-muted">
              This address is confirmed. Nothing else to do here.
            </p>
          ) : (
            <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
              <OtpInput
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                error={fieldError}
                disabled={loading}
                hint={`Send a code, then enter the ${OTP_LENGTH} digits. It expires in ${OTP_EXPIRES_IN_MINUTES} minutes.`}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="primary" loading={loading} disabled={loading}>
                  Verify email
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={loading || !email}
                >
                  Send code
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
