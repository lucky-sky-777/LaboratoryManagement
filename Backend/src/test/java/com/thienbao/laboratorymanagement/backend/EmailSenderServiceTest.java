package com.thienbao.laboratorymanagement.backend;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.EmailSenderService;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

class EmailSenderServiceTest {

	@Test
	void testSendVerificationEmailThrowsWhenUsernameMissing() {
		JavaMailSender mockMailSender = Mockito.mock(JavaMailSender.class);
		EmailSenderService service = new EmailSenderService(mockMailSender);
		ReflectionTestUtils.setField(service, "fromEmail", "");

		Assertions.assertThrows(GlobalException.class, () -> {
			service.sendVerificationOtpEmail("user@example.com", "123456", "User");
		});
	}

	@Test
	void testSendVerificationEmailCallsMailSenderWhenConfigured() {
		JavaMailSender mockMailSender = Mockito.mock(JavaMailSender.class);
		MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
		Mockito.when(mockMailSender.createMimeMessage()).thenReturn(mimeMessage);

		EmailSenderService service = new EmailSenderService(mockMailSender);
		ReflectionTestUtils.setField(service, "fromEmail", "noreply@labclass.com");

		service.sendVerificationOtpEmail("user@example.com", "654321", "Test User");

		Mockito.verify(mockMailSender, Mockito.times(1)).send(mimeMessage);
	}

}
