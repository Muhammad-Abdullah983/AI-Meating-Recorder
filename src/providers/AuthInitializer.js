"use client";

import { useAuthPersist } from "@/hooks/useAuthPersist";

export default function AuthInitializer({ children }) {
    useAuthPersist();

    return children;
}
