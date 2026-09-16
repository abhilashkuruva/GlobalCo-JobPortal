package com.jobboard;

import com.jobboard.dto.SignupRequest;
import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.Role;
import com.jobboard.entity.User;
import com.jobboard.repository.CandidateProfileRepository;
import com.jobboard.repository.RoleRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.security.JwtUtil;
import com.jobboard.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private Role candidateRole;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setUsername("testuser");
        signupRequest.setFullName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setConfirmEmail("test@example.com");
        signupRequest.setPassword("Password@123");
        signupRequest.setConfirmPassword("Password@123");
        signupRequest.setRole("CANDIDATE");

        candidateRole = new Role();
        candidateRole.setId(1L);
        candidateRole.setName("ROLE_CANDIDATE");
    }

    @Test
    void testRegisterSuccess() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_CANDIDATE")).thenReturn(Optional.of(candidateRole));
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(jwtUtil.generateToken(anyString())).thenReturn("mock-jwt-token");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(100L);
            return u;
        });
        when(candidateProfileRepository.save(any(CandidateProfile.class))).thenAnswer(i -> i.getArgument(0));

        Map<String, ?> result = authService.register(signupRequest);

        assertNotNull(result);
        assertEquals("mock-jwt-token", result.get("token"));
        assertEquals("ROLE_CANDIDATE", result.get("role"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateUsernameThrowsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(signupRequest));
        assertTrue(ex.getMessage().toLowerCase().contains("taken"));
    }
}
