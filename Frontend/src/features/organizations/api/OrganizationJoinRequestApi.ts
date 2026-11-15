import type { ResponseDTO } from "../../../dto/ResponseDTO";
import { HttpService } from "../../../services/http/HttpService";
import type {
  CreateJoinRequest,
  JoinRequestResponse,
  JoinRequestStatus,
  JoinResultResponse,
  RejectJoinRequest,
} from "../types/OrganizationType";

export class OrganizationJoinRequestApi {
  /**
   * Gửi yêu cầu gia nhập hoặc gia nhập ngay (nếu Public) bằng mã code
   */
  public static async submitJoin(
    request: CreateJoinRequest
  ): Promise<ResponseDTO<JoinResultResponse>> {
    return HttpService.post<ResponseDTO<JoinResultResponse>>(
      "/api/organizations/join",
      request
    );
  }

  /**
   * Lấy danh sách yêu cầu gia nhập của tổ chức (dành cho quản lý)
   */
  public static async getOrgJoinRequests(
    orgId: number,
    status?: JoinRequestStatus
  ): Promise<ResponseDTO<JoinRequestResponse[]>> {
    return HttpService.get<ResponseDTO<JoinRequestResponse[]>>(
      `/api/organizations/${orgId}/join-requests`,
      { params: status ? { status } : undefined }
    );
  }

  /**
   * Lấy danh sách các yêu cầu gia nhập do chính mình gửi
   */
  public static async getMyJoinRequests(
    status?: JoinRequestStatus
  ): Promise<ResponseDTO<JoinRequestResponse[]>> {
    return HttpService.get<ResponseDTO<JoinRequestResponse[]>>(
      "/api/organizations/join-requests/my",
      { params: status ? { status } : undefined }
    );
  }

  /**
   * Phê duyệt yêu cầu gia nhập
   */
  public static async approve(
    requestId: number
  ): Promise<ResponseDTO<JoinRequestResponse>> {
    return HttpService.post<ResponseDTO<JoinRequestResponse>>(
      `/api/organizations/join-requests/${requestId}/approve`
    );
  }

  /**
   * Từ chối yêu cầu gia nhập kèm lý do
   */
  public static async reject(
    requestId: number,
    rejectReason?: string
  ): Promise<ResponseDTO<JoinRequestResponse>> {
    const body: RejectJoinRequest = { reject_reason: rejectReason };
    return HttpService.post<ResponseDTO<JoinRequestResponse>>(
      `/api/organizations/join-requests/${requestId}/reject`,
      body
    );
  }

  /**
   * Người dùng tự hủy yêu cầu gia nhập đang chờ duyệt
   */
  public static async cancel(
    requestId: number
  ): Promise<ResponseDTO<JoinRequestResponse>> {
    return HttpService.post<ResponseDTO<JoinRequestResponse>>(
      `/api/organizations/join-requests/${requestId}/cancel`
    );
  }
}
