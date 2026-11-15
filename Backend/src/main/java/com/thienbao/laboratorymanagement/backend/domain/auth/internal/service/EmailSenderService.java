package com.thienbao.laboratorymanagement.backend.domain.auth.internal.service;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
@Service
public class EmailSenderService {

	private static final Logger log = LoggerFactory.getLogger(EmailSenderService.class);

	final JavaMailSender mailSender;

	@Value("${spring.mail.username:}")
	String fromEmail;

	public void sendVerificationOtpEmail(String toEmail, String code, String displayName) {
		if (fromEmail == null || fromEmail.trim().isEmpty()) {
			log.error("[EMAIL ERROR] Chưa cấu hình spring.mail.username (SPRING_MAIL_USERNAME)");
			throw new GlobalException(
					GlobalException.Type.INTERNAL_SERVER_ERROR,
					"Hệ thống chưa được cấu hình tài khoản gửi email (thiếu biến môi trường SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD)"
			);
		}

		try {
			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(
					mimeMessage,
					MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
					StandardCharsets.UTF_8.name()
			);

			helper.setFrom(fromEmail, "LabClass - Quản lý Phòng Thí Nghiệm");
			helper.setTo(toEmail);
			helper.setSubject("Mã xác thực email tài khoản LabClass: " + code);

			String safeName = (displayName != null && !displayName.trim().isEmpty())
					? displayName.trim()
					: "Quý người dùng";

			String htmlContent = buildHtmlEmailTemplate(safeName, code);
			helper.setText(htmlContent, true);

			mailSender.send(mimeMessage);
			log.info("[EMAIL SUCCESS] Đã gửi mã xác thực thành công tới {}", toEmail);
		} catch (MessagingException e) {
			log.error("[EMAIL ERROR] Lỗi tạo thông điệp email gửi tới {}: {}", toEmail, e.getMessage(), e);
			throw new GlobalException(GlobalException.Type.INTERNAL_SERVER_ERROR, "Không thể khởi tạo email xác thực: " + e.getMessage());
		} catch (Exception e) {
			log.error("[EMAIL ERROR] Gửi email xác thực tới {} thất bại: {}", toEmail, e.getMessage(), e);
			throw new GlobalException(GlobalException.Type.INTERNAL_SERVER_ERROR, "Không thể gửi email xác thực qua máy chủ SMTP: " + e.getMessage());
		}
	}

	private String buildHtmlEmailTemplate(String displayName, String code) {
		return """
			<!DOCTYPE html>
			<html lang="vi">
			<head>
			    <meta charset="UTF-8">
			    <meta name="viewport" content="width=device-width, initial-scale=1.0">
			    <title>Mã xác thực email</title>
			</head>
			<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
			    <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="padding: 30px 10px;">
			        <tr>
			            <td align="center">
			                <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
			                    <!-- Header -->
			                    <tr>
			                        <td style="background: linear-gradient(135deg, #059669 0%%, #0f766e 100%%); padding: 28px 32px; text-align: left;">
			                            <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
			                                Lab<span style="color: #a7f3d0;">Class</span>
			                            </div>
			                            <div style="font-size: 11px; color: #d1fae5; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 600;">
			                                Hệ Thống Quản Lý Phòng Thí Nghiệm
			                            </div>
			                        </td>
			                    </tr>
			                    <!-- Body -->
			                    <tr>
			                        <td style="padding: 36px 32px;">
			                            <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">
			                                Xác thực địa chỉ email
			                            </h1>
			                            <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #475569;">
			                                Xin chào <strong>%s</strong>,
			                            </p>
			                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #475569;">
			                                Bạn vừa thực hiện thao tác liên kết hoặc xác thực địa chỉ email này cho tài khoản của bạn trên hệ thống <strong>LabClass</strong>. Vui lòng sử dụng mã xác thực dưới đây để hoàn tất:
			                            </p>
			                            <!-- OTP Code Box -->
			                            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="margin: 28px 0;">
			                                <tr>
			                                    <td align="center" style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 18px 24px;">
			                                        <div style="font-size: 12px; font-weight: 600; color: #047857; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
			                                            Mã OTP của bạn
			                                        </div>
			                                        <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; color: #065f46; letter-spacing: 8px;">
			                                            %s
			                                        </div>
			                                    </td>
			                                </tr>
			                            </table>
			                            <!-- Expiry Notice -->
			                            <p style="margin: 0 0 12px; font-size: 13px; color: #64748b; line-height: 20px;">
			                                ⏱️ Mã xác thực này có hiệu lực trong vòng <strong>15 phút</strong> kể từ thời điểm gửi.
			                            </p>
			                            <p style="margin: 0 0 24px; font-size: 13px; color: #dc2626; line-height: 20px;">
			                                ⚠️ Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ quyền riêng tư và an toàn tài khoản.
			                            </p>
			                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
			                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px;">
			                                Nếu bạn không thực hiện yêu cầu này, bạn có thể yên tâm bỏ qua email này. Tài khoản của bạn vẫn được an toàn.
			                            </p>
			                        </td>
			                    </tr>
			                    <!-- Footer -->
			                    <tr>
			                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8;">
			                            © 2026 LabClass Management System. Mọi quyền được bảo lưu.
			                        </td>
			                    </tr>
			                </table>
			            </td>
			        </tr>
			    </table>
			</body>
			</html>
		""".formatted(displayName, code);
	}

}
