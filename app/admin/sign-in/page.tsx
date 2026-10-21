import { SignIn } from "@/components/admin/SignIn";

export const metadata = { title: "Sign in" };

export default async function AdminSignInPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  return (
    <div className="adm adm-signin">
      <div className="card">
        <h1>Coffee OS</h1>
        <p>Vibe Coded Coffee admin. We&apos;ll email you a sign-in code.</p>
        <SignIn denied={Boolean(denied)} />
      </div>
    </div>
  );
}
