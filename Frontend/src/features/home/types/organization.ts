import type {
  OrganizationPrivacy,
  OrganizationRole,
  JoinRequestStatus,
} from "../../organizations/types/OrganizationType";

export * from "../../organizations/types/OrganizationType";

// 3.5. Bảng organization_invites: status = [PENDING, APPROVED, REJECTED, CANCELLED]
export type InviteStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

/**
 * 3.2. Bảng `organizations`
 */
export interface OrganizationEntity {
  id: number;
  name: string;
  description: string;
  code: string;
  privacy: OrganizationPrivacy;
  creator_user_id: number;
  created_at: string;
}

/**
 * 3.3. Bảng `organization_users`
 */
export interface OrganizationUserEntity {
  id: number;
  organization_id: number;
  user_id: number;
  role: OrganizationRole;
  joined_at: string;
}

/**
 * 3.4. Bảng `organization_join_requests`
 */
export interface OrganizationJoinRequestEntity {
  id: number;
  organization_id: number;
  message: string;
  creator_user_id: number;
  creator_user_name?: string;
  creator_user_email?: string;
  created_at: string;
  status: JoinRequestStatus;
  actor_user_id?: number | null;
  actor_username?: string | null;
  actor_display_name?: string | null;
  acted_at?: string | null;
  reject_reason?: string | null;
}

/**
 * 3.5. Bảng `organization_invites`
 */
export interface OrganizationInviteEntity {
  id: number;
  organization_id: number;
  sender_user_id: number;
  sent_at: string;
  status: InviteStatus;
  receiver_user_id: number;
  receiver_email?: string;
  responded_at?: string | null;
}
