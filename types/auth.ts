export type AuthContextType = {
  login: (credentials: { email: string; code: string }, navigation: any) => Promise<{ success: boolean } | undefined>;
  loginCode: (params: { email: string }) => Promise<{ success: boolean } | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};
