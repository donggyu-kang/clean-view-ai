package com.cleanviewai.backend.config;

import org.h2.server.web.JakartaWebServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DevConfig {

    @Bean
    public ServletRegistrationBean<JakartaWebServlet> h2ConsoleServlet() {
        JakartaWebServlet servlet = new JakartaWebServlet();
        ServletRegistrationBean<JakartaWebServlet> bean =
                new ServletRegistrationBean<>(servlet, "/h2-console/*");
        bean.addInitParameter("webAllowOthers", "true");
        bean.setLoadOnStartup(1);
        return bean;
    }
}
