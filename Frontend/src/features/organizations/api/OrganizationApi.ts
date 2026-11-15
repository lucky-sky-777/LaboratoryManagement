import type { ResponseDTO } from "../../../dto/ResponseDTO";
import { HttpService } from "../../../services/http/HttpService";
import type {
  CreateOrganizationRequest,
  OrganizationResponse,
  Page,
  UpdateOrganizationRequest,
} from "../types/OrganizationType";

export class OrganizationApi {
  /**
   * Tạo tổ chức mới
   */
  public static async create(
    request: CreateOrganizationRequest
  ): Promise<ResponseDTO<OrganizationResponse>> {
    return HttpService.post<ResponseDTO<OrganizationResponse>>(
      "/api/organizations",
      request
    );
  }

  /**
   * Lấy thông tin tổ chức theo ID
   */
  public static async getById(
    id: number
  ): Promise<ResponseDTO<OrganizationResponse>> {
    return HttpService.get<ResponseDTO<OrganizationResponse>>(
      `/api/organizations/${id}`
    );
  }

  /**
   * Lấy thông tin tổ chức theo mã code
   */
  public static async getByCode(
    code: string
  ): Promise<ResponseDTO<OrganizationResponse>> {
    return HttpService.get<ResponseDTO<OrganizationResponse>>(
      `/api/organizations/code/${code}`
    );
  }

  /**
   * Lấy tất cả tổ chức (phân trang)
   */
  public static async getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ResponseDTO<Page<OrganizationResponse>>> {
    return HttpService.get<ResponseDTO<Page<OrganizationResponse>>>(
      "/api/organizations",
      { params }
    );
  }

  /**
   * Lấy danh sách tổ chức do người dùng tạo
   */
  public static async getMyCreated(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ResponseDTO<Page<OrganizationResponse>>> {
    return HttpService.get<ResponseDTO<Page<OrganizationResponse>>>(
      "/api/organizations/my",
      { params }
    );
  }

  /**
   * Lấy danh sách tổ chức công khai (PUBLIC)
   */
  public static async getPublic(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ResponseDTO<Page<OrganizationResponse>>> {
    return HttpService.get<ResponseDTO<Page<OrganizationResponse>>>(
      "/api/organizations/public",
      { params }
    );
  }

  /**
   * Cập nhật thông tin tổ chức
   */
  public static async update(
    id: number,
    request: UpdateOrganizationRequest
  ): Promise<ResponseDTO<OrganizationResponse>> {
    return HttpService.put<ResponseDTO<OrganizationResponse>>(
      `/api/organizations/${id}`,
      request
    );
  }

  /**
   * Xóa tổ chức (chỉ người tạo/Owner)
   */
  public static async delete(id: number): Promise<ResponseDTO<void>> {
    return HttpService.delete<ResponseDTO<void>>(`/api/organizations/${id}`);
  }
}
