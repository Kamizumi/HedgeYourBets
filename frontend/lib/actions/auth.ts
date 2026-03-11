"use server";
import { signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export const login = async (provider: string) => {
    // This will redirect to the sign-in page
    redirect(`/api/auth/signin/${provider}`);
}

export const logout = async () => {
    // This will redirect to the sign-out page
    redirect("/api/auth/signout");
}