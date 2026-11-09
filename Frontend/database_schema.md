# Database Schema

### 3.1. Bảng users

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | bigint | Khóa chính |
| provider | text | [GOOGLE] |
| provider_id | text | |
| username | text | Tên người dùng |
| password_hash | text | |
| display_name | text | Tên hiển thị |
| avatar_url | text | Url ảnh đại diện |
| email | text | |
| joined_at | timestamptz | Thời điểm tạo |

## 3.2. Bảng `organizations`

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | bigint | Khóa chính |
| name | text | Tên tổ chức |
| description | text | Mô tả |
| code | varchar(10) | Mã tham gia tổ chức |
| privacy | text | Phạm vi truy cập: PUBLIC, PRIVATE |
| creator_user_id | bigint | Người dùng tạo tổ chức |
| created_at | timestamptz | Thời điểm tạo |

### 3.3. Bảng organization_users

| Cột             | Kiểu dữ liệu | Mô tả |
|-----------------|---|---|
| id              | bigint | |
| organization_id | bigint | |
| user_id         | bigint | |
| role            | text | [OWNER, ORGANIZATION_MANAGER, LABORATORY_MANAGER, MEMBER] |
| joined_at       | timestamptz | |

### 3.4. Bảng organization_join_requests

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | bigint | |
| organization_id | bigint | |
| message | text | |
| creator_user_id | bigint | |
| created_at | timestamptz | |
| status | text | [PENDING, APPROVED, REJECTED, CANCELLED] |
| actor_user_id | bigint | |
| acted_at | timestamptz | |
| reject_reason | text | |

### 3.5. Bảng organization_invites

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | bigint | |
| organization_id | bigint | |
| sender_user_id | bigint | |
| sent_at | timestamptz | |
| status | text | [PEDNING, APPROVED, REJECTED, CANCELLED] |
| receiver_user_id | bigint | |
| responded_at | timestamptz | |