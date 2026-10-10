import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { api } from "../lib/api";
import * as authService from "../services/auth";
import type { LoginCredentials, User } from "../types/auth";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // Arranca en true: hasta que /auth/me responda no sabemos si hay sesión,
  // y el guard tiene que esperar en vez de mandar al login a alguien que sí está logueado.
  const [loading, setLoading] = useState<boolean>(true);

  // La cookie es httpOnly: JS no la puede leer, así que le preguntamos al backend quién somos.
  useEffect(() => {
    const loadSession = async () => {
      try {
        setUser(await authService.getMe());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Si cualquier request devuelve 401 (refreshToken vencido), damos la sesión por cerrada.
  useEffect(() => {
    const handleResponseError = async (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
      }
      throw error;
    };

    const interceptorId = api.interceptors.response.use(undefined, handleResponseError);

    return () => api.interceptors.response.eject(interceptorId);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setUser(await authService.login(credentials));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return <AuthContext value={{ user, loading, login, logout }}>{children}</AuthContext>;
};
