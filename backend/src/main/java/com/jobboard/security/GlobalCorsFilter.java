package com.jobboard.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

/**
 * Highest-priority CORS filter that runs BEFORE the Spring Security filter chain.
 * This ensures the Access-Control-Allow-Origin header is always present on ALL
 * responses — including 401/403 error responses — which Spring Security's built-in
 * CORS handling can miss when requests fail authentication before reaching the CORS bean.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalCorsFilter implements Filter {

    private final List<String> allowedOriginPatterns;

    public GlobalCorsFilter(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        List<String> configured = Stream.of(allowedOrigins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .toList();
        // Always include these safety patterns
        this.allowedOriginPatterns = Stream.concat(
                configured.stream(),
                Stream.of(
                        "https://*.vercel.app",
                        "https://vercel.app",
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
        ).distinct().toList();
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");
        if (origin != null && isOriginAllowed(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
            response.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,X-Requested-With,Cache-Control");
            response.setHeader("Access-Control-Expose-Headers", "Authorization,Content-Disposition");
            response.setHeader("Access-Control-Max-Age", "3600");
            response.setHeader("Vary", "Origin");
        }

        // Handle preflight immediately
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }

    private boolean isOriginAllowed(String origin) {
        for (String pattern : allowedOriginPatterns) {
            if (matchesPattern(origin, pattern)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesPattern(String origin, String pattern) {
        if (!pattern.contains("*")) {
            return origin.equals(pattern);
        }
        // Convert wildcard pattern to regex: https://*.vercel.app → https://.*\.vercel\.app
        String regex = pattern
                .replace(".", "\\.")
                .replace("*", ".*");
        return origin.matches(regex);
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}
