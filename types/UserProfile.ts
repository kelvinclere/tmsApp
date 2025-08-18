export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  citizenship: string;
  sex: string;
  sne: boolean;
  id_number: string;
  tsc_number: string;
  school_name: string;
  school_county: string;
  school_sub_county: string;
  teaching: string[];
  organization_name: string;
  designation: string;
  profile_completed: boolean;
  created_at?: string;
  role?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: {
    user?: T;
  };
  user?: T;
  error?: string;
  status?: number;
}