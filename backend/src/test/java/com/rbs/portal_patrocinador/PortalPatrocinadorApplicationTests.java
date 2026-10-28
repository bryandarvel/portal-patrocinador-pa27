package com.rbs.portal_patrocinador;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "portal.jwt.secret=12345678901234567890123456789012",
        "spring.datasource.url=jdbc:h2:mem:portal-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class PortalPatrocinadorApplicationTests {

	@Test
	void contextLoads() {
	}

}
