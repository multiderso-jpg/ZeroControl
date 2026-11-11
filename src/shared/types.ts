import {
  INTENTIONS,
  MODALITIES,
  COMPENSATION_TYPES,
  POST_STATUSES,
  APPLICATION_STATUSES,
  USER_ROLES,
} from './constants';

export type UserRole = (typeof USER_ROLES)[number];
export type IntentionType = (typeof INTENTIONS)[number];
export type ModalityType = (typeof MODALITIES)[number];
export type CompensationType = (typeof COMPENSATION_TYPES)[number];
export type PostStatus = (typeof POST_STATUSES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface SafeUser {
  id: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  visibility: 'public' | 'members_only' | 'private';
  created_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  thumbnail_url: string;
  is_cover: boolean;
  order_index: number;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  author_username: string;
  author_avatar_url: string | null;
  origin_module: string;
  intention: IntentionType;
  title: string;
  description: string;
  opportunity_type_slug: string;
  opportunity_type_name: string;
  service_category_slug: string;
  service_category_name: string;
  modality: ModalityType;
  city: string | null;
  state: string | null;
  compensation_type: CompensationType;
  amount_cents: number | null;
  amount_min_cents: number | null;
  amount_max_cents: number | null;
  amount_unit: string | null;
  deadline: string | null;
  status: PostStatus;
  version: number;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  is_saved?: boolean;
  user_application_status?: ApplicationStatus | null;
  applications_count?: number;
}

export interface Application {
  id: string;
  post_id: string;
  applicant_id: string;
  applicant_username: string;
  applicant_avatar_url: string | null;
  message: string;
  proposed_amount_cents: number | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  post_title?: string;
  author_username?: string;
}

export interface QuoteRequest {
  id: string;
  requester_id: string;
  requester_username: string;
  service_title: string;
  description: string;
  estimated_budget: string | null;
  status: 'pendente' | 'em_analise' | 'respondido' | 'encerrado';
  created_at: string;
}

export interface SupportRequest {
  id: string;
  requester_id: string;
  requester_username: string;
  subject: string;
  category: string;
  message: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido' | 'fechado';
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_username: string;
  post_id: string;
  post_title: string;
  category: string;
  description: string;
  status: 'pendente' | 'em_analise' | 'procedente' | 'improcedente';
  decision_notes: string | null;
  decided_by_username: string | null;
  created_at: string;
  decided_at: string | null;
}
