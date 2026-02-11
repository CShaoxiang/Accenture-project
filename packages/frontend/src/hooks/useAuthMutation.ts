import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useRegister() {
  const { register } = useAuth();

  return useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => register(email, password, name),
  });
}
