import type { ResponseDTO } from "../../../dto/ResponseDTO";
import { HttpService } from "../../../services/http/HttpService";
import type {
  AddMemberRequest,
  OrganizationRole,
  OrganizationUserResponse,
  TransferOwnershipRequest,
  UpdateMemberRoleRequest,
} from "../types/OrganizationType";

export class OrganizationUserApi {
  /**
   * Lấy danh sách thành viên của một tổ chức
   */
  public static async getMembers(
    orgId: number
  ): Promise<ResponseDTO<OrganizationUserResponse[]>> {
    return HttpService.get<ResponseDTO<OrganizationUserResponse[]>>(
      `/api/organizations/${orgId}/members`
    );
  }

  /**
   * Lấy danh sách tổ chức mà user hiện tại đang tham gia (kèm vai trò)
   */
  public static async getJoinedOrganizations(): Promise<
    ResponseDTO<OrganizationUserResponse[]>
  > {
    return HttpService.get<ResponseDTO<OrganizationUserResponse[]>>(
      "/api/organizations/joined"
    );
  }

  /**
   * Thêm thành viên trực tiếp vào tổ chức (dành cho quản lý)
   */
  public static async addMember(
    orgId: number,
    request: AddMemberRequest
  ): Promise<ResponseDTO<OrganizationUserResponse>> {
    return HttpService.post<ResponseDTO<OrganizationUserResponse>>(
      `/api/organizations/${orgId}/members`,
      request
    );
  }

  /**
   * Cập nhật vai trò thành viên
   */
  public static async updateRole(
    orgId: number,
    userId: number,
    role: OrganizationRole
  ): Promise<ResponseDTO<OrganizationUserResponse>> {
    const request: UpdateMemberRoleRequest = { role };
    return HttpService.patch<ResponseDTO<OrganizationUserResponse>>(
      `/api/organizations/${orgId}/members/${userId}/role`,
      request
    );
  }

  /**
   * Xóa thành viên khỏi tổ chức
   */
  public static async removeMember(
    orgId: number,
    userId: number
  ): Promise<ResponseDTO<void>> {
    return HttpService.delete<ResponseDTO<void>>(
      `/api/organizations/${orgId}/members/${userId}`
    );
  }

  /**
   * Tự rời khỏi tổ chức
   */
  public static async leaveOrganization(
    orgId: number
  ): Promise<ResponseDTO<void>> {
    return HttpService.post<ResponseDTO<void>>(
      `/api/organizations/${orgId}/leave`
    );
  }

  /**
   * Chuyển quyền chủ sở hữu tổ chức (chỉ Owner)
   */
  public static async transferOwnership(
    orgId: number,
    newOwnerUserId: number
  ): Promise<ResponseDTO<OrganizationUserResponse>> {
    const request: TransferOwnershipRequest = {
      new_owner_user_id: newOwnerUserId,
    };
    return HttpService.post<ResponseDTO<OrganizationUserResponse>>(
      `/api/organizations/${orgId}/transfer-ownership`,
      request
    );
  }
}
