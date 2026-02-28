// Fix: Import React to resolve the 'React' namespace used in React.ReactNode
import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

export interface OutfitData {
  main: string;
  thumb: string;
  active: string;
}

export type UserRole = 'guest' | 'support' | 'moderator' | 'admin';

export interface User {
  id: string;
  internal_id?: number;
  username: string;
  avatar?: string;
  role?: UserRole;
  isAdmin?: boolean;
  hasAccess?: boolean;
}

export type CommentStatus = 'open' | 'handled';

export interface AdminComment {
  id: number;
  section_id: number;
  section_title?: string | null;
  username: string;
  avatar?: string | null;
  content: string;
  created_at: string;
  status?: CommentStatus;
  handled_at?: string | null;
}