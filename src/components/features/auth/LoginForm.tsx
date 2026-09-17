import { AuthScreen } from "./AuthScreen";
import { GoogleLogin } from "./GoogleLogin";

export function LoginForm() {
  return (
    <AuthScreen>
      <GoogleLogin />
    </AuthScreen>
  );
}
