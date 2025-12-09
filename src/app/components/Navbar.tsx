"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav>
      <Link href="/">HelpDeskPro</Link>
      {session ? (
        <>
          <span>Bienvenido, {session.user?.name}</span>
          <button onClick={() => signOut()}>Cerrar Sesión</button>
        </>
      ) : (
        <Link href="/login">Iniciar Sesión</Link>
      )}
    </nav>
  );
}
