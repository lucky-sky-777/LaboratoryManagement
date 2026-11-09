/**
 * Types mapping strictly to database_schema.md
 */

// 3.2. Bảng organizations: privacy = PUBLIC, PRIVATE
export type OrganizationPrivacy = "PUBLIC" | "PRIVATE";

// 3.3. Bảng organization_users: role = [OWNER, ORGANIZATION_MANAGER, LABORATORY_MANAGER, MEMBER]
export type OrganizationRole =
  | "OWNER"
  | "ORGANIZATION_MANAGER"
  | "LABORATORY_MANAGER"
  | "MEMBER";

// 3.4. Bảng organization_join_requests: status = [PENDING, APPROVED, REJECTED, CANCELLED]
export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

// 3.5. Bảng organization_invites: status = [PENDING, APPROVED, REJECTED, CANCELLED]
export type InviteStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

/**
 * 3.2. Bảng `organizations`
 */
export interface OrganizationEntity {
  id: number; // bigint Khóa chính
  name: string; // text Tên tổ chức
  description: string; // text Mô tả
  code: string; // varchar(10) Mã tham gia tổ chức
  privacy: OrganizationPrivacy; // text Phạm vi truy cập: PUBLIC, PRIVATE
  creator_user_id: number; // bigint Người dùng tạo tổ chức
  created_at: string; // timestamptz Thời điểm tạo
}

/**
 * 3.3. Bảng `organization_users`
 */
export interface OrganizationUserEntity {
  id: number; // bigint
  organization_id: number; // bigint
  user_id: number; // bigint
  role: OrganizationRole; // text [OWNER, ORGANIZATION_MANAGER, LABORATORY_MANAGER, MEMBER]
  joined_at: string; // timestamptz
}

/**
 * 3.4. Bảng `organization_join_requests`
 */
export interface OrganizationJoinRequestEntity {
  id: number; // bigint
  organization_id: number; // bigint
  message: string; // text Lời nhắn khi xin gia nhập
  creator_user_id: number; // bigint Người gửi yêu cầu
  creator_user_name?: string; // Tên hiển thị người gửi
  creator_user_email?: string; // Email người gửi
  created_at: string; // timestamptz
  status: JoinRequestStatus; // text [PENDING, APPROVED, REJECTED, CANCELLED]
  actor_user_id?: number | null; // bigint Người duyệt/từ chối
  acted_at?: string | null; // timestamptz
  reject_reason?: string | null; // text Lý do từ chối
}

/**
 * 3.5. Bảng `organization_invites`
 */
export interface OrganizationInviteEntity {
  id: number; // bigint
  organization_id: number; // bigint
  sender_user_id: number; // bigint
  sent_at: string; // timestamptz
  status: InviteStatus; // text [PENDING, APPROVED, REJECTED, CANCELLED]
  receiver_user_id: number; // bigint
  receiver_email?: string;
  responded_at?: string | null; // timestamptz
}

/**
 * Combined View Model for Organization Item displayed on HomePage & Grid Cards
 */
export interface OrganizationItemDTO extends OrganizationEntity {
  // Current user's membership in this organization (from organization_users)
  user_role: OrganizationRole;
  user_joined_at: string; // timestamptz

  // Creator information (from users table)
  creator_display_name?: string;
  creator_email?: string;

  // Aggregated data
  members_count: number;
  pending_requests_count?: number; // count of PENDING join requests

  // UI Theme styling
  theme_color?: "emerald" | "blue" | "indigo" | "purple" | "amber" | "teal";
  is_pinned?: boolean;
}

/**
 * Helper to check if a role is a management role
 */
export function isManagerRole(role: OrganizationRole): boolean {
  return (
    role === "OWNER" ||
    role === "ORGANIZATION_MANAGER" ||
    role === "LABORATORY_MANAGER"
  );
}

/**
 * Helper to display human-readable label for OrganizationRole
 */
export function getRoleLabel(role: OrganizationRole): string {
  switch (role) {
    case "OWNER":
      return "Chủ sở hữu";
    case "ORGANIZATION_MANAGER":
      return "Quản lý tổ chức";
    case "LABORATORY_MANAGER":
      return "Quản lý phòng lab";
    case "MEMBER":
      return "Thành viên";
    default:
      return role;
  }
}
