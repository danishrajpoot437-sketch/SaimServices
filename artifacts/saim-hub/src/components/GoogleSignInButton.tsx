import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4069 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4523 0.347727 11.8269 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9255L15.0218 2.3441C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
    </svg>
  );
}

interface GoogleSignInButtonProps {
  loading: boolean;
  disabled: boolean;
  onLoadingChange: (v: boolean) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function GoogleSignInButton({ loading, disabled, onLoadingChange, onSuccess, onError }: GoogleSignInButtonProps) {
  const { googleSignIn } = useAuth();

  const trigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleSignIn(tokenResponse.access_token);
        onSuccess();
      } catch (ex) {
        onError(ex instanceof Error ? ex.message : "Google sign-in failed. Please try again.");
      } finally {
        onLoadingChange(false);
      }
    },
    onError: () => {
      onError("Google sign-in was cancelled or failed. Please try again.");
      onLoadingChange(false);
    },
  });

  return (
    <button
      type="button"
      onClick={() => { onLoadingChange(true); trigger(); }}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.13)",
        color: "rgba(255,255,255,0.85)",
        opacity: loading ? 0.7 : 1,
        cursor: loading || disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.background = "rgba(255,255,255,0.09)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)";
      }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}
