import { SignIn } from "@/components/admin/SignIn";

export const metadata = { title: "Sign in" };

export default function AdminSignInPage() {
  return (
    <div className="adm adm-signin">
      <div className="card">
        <h1>Coffee OS</h1>
        <p>Vibe Coded Coffee admin. Enter the admin password.</p>
        <SignIn />
      </div>
    </div>
  );
}
