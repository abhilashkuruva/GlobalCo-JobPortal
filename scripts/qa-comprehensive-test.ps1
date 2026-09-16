$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8080"
$feUrl = "http://localhost:5173"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  GLOBALCO-JOBPORTAL COMPREHENSIVE QA & END-TO-END TEST  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0
$issues = @()

function Assert-Step {
    param (
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  [FAIL] $Name : $Details" -ForegroundColor Red
        $script:failed++
        $script:issues += "$Name : $Details"
    }
}

# ----------------------------------------------------
# 1. FRONTEND SERVER CONNECTIVITY
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 1: Frontend & Backend Liveness ---" -ForegroundColor Yellow
try {
    $feRes = Invoke-WebRequest -Uri $feUrl -UseBasicParsing -TimeoutSec 5
    Assert-Step "Frontend dev server responds at $feUrl" ($feRes.StatusCode -eq 200) "Status $($feRes.StatusCode)"
} catch {
    Assert-Step "Frontend dev server responds at $feUrl" $false $_.Exception.Message
}

try {
    $beRes = Invoke-WebRequest -Uri "$baseUrl/api/jobs" -UseBasicParsing -TimeoutSec 5
    Assert-Step "Backend REST API responds at $baseUrl/api/jobs" ($beRes.StatusCode -eq 200) "Status $($beRes.StatusCode)"
} catch {
    Assert-Step "Backend REST API responds at $baseUrl/api/jobs" $false $_.Exception.Message
}

# ----------------------------------------------------
# 2. USER REGISTRATION & AUTHENTICATION
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 2: User Registration & Authentication ---" -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$seekerUsername = "seeker_$timestamp"
$seekerEmail = "qa_seeker_$timestamp@test.com"
$testPassword = "Password@123"

# 2.1 Register Seeker
$seekerRegBody = @{
    username = $seekerUsername
    fullName = "QA Seeker User"
    email = $seekerEmail
    password = $testPassword
    role = "CANDIDATE"
    location = "San Francisco, CA"
    mobileNumber = "+1-555-0199"
} | ConvertTo-Json

$newSeekerToken = ""
try {
    $regRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $seekerRegBody -ContentType "application/json"
    $newSeekerToken = $regRes.token
    Assert-Step "Register new Job Seeker account ($seekerUsername)" ($null -ne $newSeekerToken -and $newSeekerToken.Length -gt 10) "Registered and received JWT"
} catch {
    Assert-Step "Register new Job Seeker account ($seekerUsername)" $false $_.Exception.Message
}

# 2.2 Register Duplicate Seeker (Negative test)
try {
    $dupRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $seekerRegBody -ContentType "application/json"
    Assert-Step "Duplicate registration rejected" $false "Expected error, but got success"
} catch {
    Assert-Step "Duplicate registration rejected" ($_.Exception.Response.StatusCode.value__ -ge 400) "Properly rejected duplicate with HTTP $($_.Exception.Response.StatusCode.value__)"
}

# 2.3 Invalid Login (Negative test)
$badLoginBody = @{
    username = $seekerUsername
    password = "WrongPassword999"
} | ConvertTo-Json

try {
    $badLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $badLoginBody -ContentType "application/json"
    Assert-Step "Login with invalid password rejected" $false "Expected 401, got success"
} catch {
    Assert-Step "Login with invalid password rejected" ($_.Exception.Response.StatusCode.value__ -eq 401 -or $_.Exception.Response.StatusCode.value__ -eq 400) "Properly rejected"
}

# 2.4 Valid Seeker Login with Registered Account
$seekerLoginBody = @{
    username = $seekerUsername
    password = $testPassword
} | ConvertTo-Json

$seekerToken = ""
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $seekerLoginBody -ContentType "application/json"
    $seekerToken = $loginRes.token
    Assert-Step "Job Seeker valid login returns JWT token" ($null -ne $seekerToken -and $seekerToken.Length -gt 10) "Token length: $($seekerToken.Length)"
} catch {
    Assert-Step "Job Seeker valid login returns JWT token" $false $_.Exception.Message
}

# 2.5 Demo Recruiter Login (mira.recruiter / Password@123)
$recruiterLoginBody = @{
    username = "mira.recruiter"
    password = "Password@123"
} | ConvertTo-Json

$recruiterToken = ""
try {
    $rLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $recruiterLoginBody -ContentType "application/json"
    $recruiterToken = $rLoginRes.token
    Assert-Step "Recruiter valid login returns JWT token" ($null -ne $recruiterToken -and $recruiterToken.Length -gt 10) "Token length: $($recruiterToken.Length), Role: $($rLoginRes.role)"
} catch {
    Assert-Step "Recruiter valid login returns JWT token" $false $_.Exception.Message
}

# 2.6 Admin Login (admin / Password@123)
$adminLoginBody = @{
    username = "admin"
    password = "Password@123"
} | ConvertTo-Json

$adminToken = ""
try {
    $aLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    $adminToken = $aLoginRes.token
    Assert-Step "Admin valid login returns JWT token" ($null -ne $adminToken -and $adminToken.Length -gt 10) "Token length: $($adminToken.Length), Role: $($aLoginRes.role)"
} catch {
    Assert-Step "Admin valid login returns JWT token" $false $_.Exception.Message
}

# ----------------------------------------------------
# 3. PROFILE MANAGEMENT
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 3: Profile Management ---" -ForegroundColor Yellow
$seekerHeaders = @{ "Authorization" = "Bearer $seekerToken"; "Content-Type" = "application/json" }
$recruiterHeaders = @{ "Authorization" = "Bearer $recruiterToken"; "Content-Type" = "application/json" }
$adminHeaders = @{ "Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json" }

try {
    $profileRes = Invoke-RestMethod -Uri "$baseUrl/api/profiles/me" -Headers $seekerHeaders -Method Get
    Assert-Step "Fetch seeker profile via GET /api/profiles/me" ($null -ne $profileRes) "Profile fetched successfully"
} catch {
    Assert-Step "Fetch seeker profile via GET /api/profiles/me" $false $_.Exception.Message
}

# Update seeker profile
$updateProfileBody = @{
    fullName = "QA Seeker User Lead"
    summary = "Expert in end-to-end automation, Spring Boot and React."
    location = "San Francisco, CA"
    skills = @("Java", "Spring Boot", "React", "Playwright")
    totalExperienceYears = 6
    currentJobTitle = "Senior QA Automation Engineer"
    expectedSalary = 140000
    resumeUrl = "/api/resumes/view/sample_candidate_resume.pdf"
    resumeFileName = "sample_candidate_resume.pdf"
} | ConvertTo-Json

try {
    $upRes = Invoke-RestMethod -Uri "$baseUrl/api/profiles/me" -Headers $seekerHeaders -Method Put -Body $updateProfileBody
    Assert-Step "Update seeker profile via PUT /api/profiles/me" ($null -ne $upRes -and $upRes.currentJobTitle -eq "Senior QA Automation Engineer") "Updated title: $($upRes.currentJobTitle)"
} catch {
    Assert-Step "Update seeker profile via PUT /api/profiles/me" $false $_.Exception.Message
}

# ----------------------------------------------------
# 4. JOB SEARCH, CATEGORIES & SAVED JOBS
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 4: Job Browsing, Search, Filters & Saved Jobs ---" -ForegroundColor Yellow

try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method Get
    Assert-Step "Fetch categories via GET /api/categories" ($categories.Count -gt 0) "Found $($categories.Count) categories"
} catch {
    Assert-Step "Fetch categories via GET /api/categories" $false $_.Exception.Message
}

$firstJobId = $null
try {
    $jobsPage = Invoke-RestMethod -Uri "$baseUrl/api/jobs?page=0&size=10" -Method Get
    $content = if ($jobsPage.content) { $jobsPage.content } else { $jobsPage }
    $firstJobId = $content[0].id
    Assert-Step "Browse jobs via GET /api/jobs" ($content.Count -gt 0 -and $null -ne $firstJobId) "Found $($content.Count) jobs in page, first job ID: $firstJobId"
} catch {
    Assert-Step "Browse jobs via GET /api/jobs" $false $_.Exception.Message
}

# Keyword search
try {
    $searchPage = Invoke-RestMethod -Uri "$baseUrl/api/jobs?keyword=Engineer" -Method Get
    $searchContent = if ($searchPage.content) { $searchPage.content } else { $searchPage }
    Assert-Step "Search jobs by keyword ('Engineer')" ($searchContent.Count -gt 0) "Found $($searchContent.Count) matching jobs"
} catch {
    Assert-Step "Search jobs by keyword" $false $_.Exception.Message
}

# Save a job
if ($firstJobId) {
    try {
        $saveRes = Invoke-RestMethod -Uri "$baseUrl/api/saved-jobs/$firstJobId" -Headers $seekerHeaders -Method Post
        Assert-Step "Save job ID $firstJobId via POST /api/saved-jobs/{id}" ($null -ne $saveRes) "Job saved"
    } catch {
        Assert-Step "Save job ID $firstJobId" $false $_.Exception.Message
    }

    try {
        $savedList = Invoke-RestMethod -Uri "$baseUrl/api/saved-jobs" -Headers $seekerHeaders -Method Get
        Assert-Step "List saved jobs via GET /api/saved-jobs" ($savedList.Count -ge 1) "Saved jobs count: $($savedList.Count)"
    } catch {
        Assert-Step "List saved jobs" $false $_.Exception.Message
    }
}

# ----------------------------------------------------
# 5. RECRUITER JOB POSTING & RECRUITER DASHBOARD
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 5: Recruiter Job Posting & Management ---" -ForegroundColor Yellow

$newJobId = $null
$newJobPayload = @{
    title = "Lead Quality Assurance Architect"
    description = "Leading enterprise QA automation framework design and execution."
    responsibilities = "Design and execute automated integration test pipelines."
    requirements = "5+ years in QA automation, Java, React, CI/CD pipelines."
    jobType = "Full Time"
    location = "Remote"
    minExperience = 5
    maxExperience = 10
    salaryRange = "$130,000 - $160,000"
    companyName = "TechCorp Global"
    categoryName = "Engineering"
    skills = @("Java", "Spring Boot", "React", "Automated Testing")
} | ConvertTo-Json

try {
    $createdJob = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/jobs" -Headers $recruiterHeaders -Method Post -Body $newJobPayload
    $newJobId = $createdJob.id
    Assert-Step "Recruiter posts new job via POST /api/recruiter/jobs" ($null -ne $newJobId) "Created Job ID: $newJobId, Title: $($createdJob.title)"
} catch {
    Assert-Step "Recruiter posts new job" $false $_.Exception.Message
}

# Recruiter fetches their posted jobs
try {
    $myJobs = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/my-jobs" -Headers $recruiterHeaders -Method Get
    $myJobsContent = if ($myJobs.content) { $myJobs.content } else { $myJobs }
    Assert-Step "Recruiter retrieves posted jobs via GET /api/recruiter/my-jobs" ($myJobsContent.Count -gt 0) "Recruiter has $($myJobsContent.Count) jobs"
} catch {
    Assert-Step "Recruiter retrieves posted jobs" $false $_.Exception.Message
}

# ----------------------------------------------------
# 6. APPLICATION SUBMISSION & DUPLICATE CHECKS
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 6: Job Application Lifecycle ---" -ForegroundColor Yellow

$targetJobId = if ($newJobId) { $newJobId } else { $firstJobId }
$applicationId = $null

$applyPayload = @{
    jobId = $targetJobId
    coverLetter = "I am excited to apply for this role. I have extensive experience in full-stack testing and modern automation architectures."
    resumeUrl = "/api/resumes/view/sample_candidate_resume.pdf"
    resumeFileName = "sample_candidate_resume.pdf"
} | ConvertTo-Json

try {
    $applyRes = Invoke-RestMethod -Uri "$baseUrl/api/applications/$targetJobId" -Headers $seekerHeaders -Method Post -Body $applyPayload
    $applicationId = $applyRes.id
    Assert-Step "Job seeker applies to job $targetJobId" ($null -ne $applicationId) "Application ID: $applicationId, Status: $($applyRes.status)"
} catch {
    # Alternative endpoint check
    try {
        $applyRes = Invoke-RestMethod -Uri "$baseUrl/api/applications" -Headers $seekerHeaders -Method Post -Body $applyPayload
        $applicationId = $applyRes.id
        Assert-Step "Job seeker applies to job $targetJobId" ($null -ne $applicationId) "Application ID: $applicationId"
    } catch {
        Assert-Step "Job seeker applies to job $targetJobId" $false $_.Exception.Message
    }
}

# Verify Seeker's My-Applications list
try {
    $myApps = Invoke-RestMethod -Uri "$baseUrl/api/applications/my-applications" -Headers $seekerHeaders -Method Get
    $count = if ($null -ne $myApps.totalElements) { [int]$myApps.totalElements } elseif ($null -ne $myApps.content) { @($myApps.content).Count } else { @($myApps).Count }
    Assert-Step "Seeker views applied jobs via GET /api/applications/my-applications" ($count -ge 1) "Applications count: $count"
} catch {
    Assert-Step "Seeker views applied jobs" $false $_.Exception.Message
}

# Attempt duplicate application (Negative test)
try {
    $dupApply = Invoke-RestMethod -Uri "$baseUrl/api/applications/$targetJobId" -Headers $seekerHeaders -Method Post -Body $applyPayload
    Assert-Step "Duplicate application prevented" $false "Expected error on duplicate application, but succeeded"
} catch {
    Assert-Step "Duplicate application prevented" ($_.Exception.Response.StatusCode.value__ -ge 400) "Properly rejected duplicate with HTTP $($_.Exception.Response.StatusCode.value__)"
}

# ----------------------------------------------------
# 7. RECRUITER APPLICANT REVIEW & STATUS SYNCHRONIZATION
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 7: Recruiter Review & Status Synchronization ---" -ForegroundColor Yellow

try {
    $applicants = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/jobs/$targetJobId/applicants" -Headers $recruiterHeaders -Method Get
    $applicantsList = @($applicants)
    Assert-Step "Recruiter retrieves applicants for job $targetJobId" ($applicantsList.Count -ge 1) "Applicant count: $($applicantsList.Count)"
} catch {
    Assert-Step "Recruiter retrieves applicants for job $targetJobId" $false $_.Exception.Message
}

# Update application status: SHORTLISTED
if ($applicationId) {
    $statusPayload = @{
        status = "SHORTLISTED"
    } | ConvertTo-Json

    try {
        $statusRes = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/applications/$applicationId/status" -Headers $recruiterHeaders -Method Put -Body $statusPayload
        Assert-Step "Recruiter updates application status to SHORTLISTED" ($statusRes.status -eq "SHORTLISTED") "Updated status: $($statusRes.status)"
    } catch {
        Assert-Step "Recruiter updates application status to SHORTLISTED" $false $_.Exception.Message
    }

    # Add recruiter notes
    $notesPayload = @{
        notes = "Candidate has strong test automation profile and leadership experience."
    } | ConvertTo-Json

    try {
        $notesRes = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/applications/$applicationId/notes" -Headers $recruiterHeaders -Method Put -Body $notesPayload
        Assert-Step "Recruiter adds evaluation notes" ($null -ne $notesRes) "Notes updated successfully"
    } catch {
        Assert-Step "Recruiter adds evaluation notes" $false $_.Exception.Message
    }
}

# ----------------------------------------------------
# 8. NOTIFICATION SYNCHRONIZATION
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 8: Real-time Notification Synchronization ---" -ForegroundColor Yellow

try {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Headers $seekerHeaders -Method Get
    $notifList = @($notifications)
    Assert-Step "Seeker receives notifications" ($notifList.Count -ge 1) "Notification count: $($notifList.Count)"
    
    $unreadCountRes = Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread-count" -Headers $seekerHeaders -Method Get
    $unreadCount = if ($null -ne $unreadCountRes.unreadCount) { $unreadCountRes.unreadCount } elseif ($null -ne $unreadCountRes.count) { $unreadCountRes.count } else { $unreadCountRes }
    Assert-Step "Unread notification count endpoint functional" ($null -ne $unreadCount) "Unread count: $unreadCount"

    # Mark first notification as read
    if ($notifList.Count -ge 1) {
        $firstNotifId = $notifList[0].id
        $readRes = Invoke-RestMethod -Uri "$baseUrl/api/notifications/$firstNotifId/read" -Headers $seekerHeaders -Method Put
        Assert-Step "Mark notification $firstNotifId as read" ($null -ne $readRes) "Marked as read"
    }
} catch {
    Assert-Step "Seeker receives notifications" $false $_.Exception.Message
}

# ----------------------------------------------------
# 9. ADMIN OPERATIONS & METRICS
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 9: Admin Dashboard & User Management ---" -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Headers $adminHeaders -Method Get
    Assert-Step "Admin retrieves platform stats" ($null -ne $stats.totalUsers -and $null -ne $stats.totalJobs) "Users: $($stats.totalUsers), Jobs: $($stats.totalJobs), Applications: $($stats.totalApplications)"
} catch {
    Assert-Step "Admin retrieves platform stats" $false $_.Exception.Message
}

try {
    $adminUsers = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Headers $adminHeaders -Method Get
    $usersContent = if ($adminUsers.content) { $adminUsers.content } else { $adminUsers }
    Assert-Step "Admin retrieves user list via GET /api/admin/users" ($usersContent.Count -gt 0) "Total user records retrieved: $($usersContent.Count)"
} catch {
    Assert-Step "Admin retrieves user list" $false $_.Exception.Message
}

try {
    $adminJobs = Invoke-RestMethod -Uri "$baseUrl/api/admin/jobs" -Headers $adminHeaders -Method Get
    $jobsContent = if ($adminJobs.content) { $adminJobs.content } else { $adminJobs }
    Assert-Step "Admin retrieves all jobs via GET /api/admin/jobs" ($jobsContent.Count -gt 0) "Total job records: $($jobsContent.Count)"
} catch {
    Assert-Step "Admin retrieves all jobs" $false $_.Exception.Message
}

try {
    $recReqs = Invoke-RestMethod -Uri "$baseUrl/api/admin/recruiter-requests" -Headers $adminHeaders -Method Get
    Assert-Step "Admin retrieves recruiter verification requests" ($null -ne $recReqs) "Recruiter requests retrieved"
} catch {
    Assert-Step "Admin retrieves recruiter verification requests" $false $_.Exception.Message
}

# ----------------------------------------------------
# 10. ROLE-BASED ACCESS CONTROL (RBAC) GUARDS
# ----------------------------------------------------
Write-Host "`n--- TEST SUITE 10: Security & RBAC Enforcement ---" -ForegroundColor Yellow

# 10.1 Seeker tries to access Admin Stats (expects 403)
try {
    $unauthRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Headers $seekerHeaders -Method Get
    Assert-Step "Seeker blocked from Admin Stats (403)" $false "Expected 403 Forbidden, but request succeeded"
} catch {
    $sc = $_.Exception.Response.StatusCode.value__
    Assert-Step "Seeker blocked from Admin Stats (403)" ($sc -eq 403) "Correctly forbidden (HTTP $sc)"
}

# 10.2 Seeker tries to post a job (expects 403)
try {
    $unauthJob = Invoke-RestMethod -Uri "$baseUrl/api/recruiter/jobs" -Headers $seekerHeaders -Method Post -Body $newJobPayload
    Assert-Step "Seeker blocked from Recruiter Job Posting (403)" $false "Expected 403 Forbidden, but request succeeded"
} catch {
    $sc = $_.Exception.Response.StatusCode.value__
    Assert-Step "Seeker blocked from Recruiter Job Posting (403)" ($sc -eq 403) "Correctly forbidden (HTTP $sc)"
}

# 10.3 Unauthenticated access to /api/profiles/me (expects 403 or 401)
try {
    $anonRes = Invoke-RestMethod -Uri "$baseUrl/api/profiles/me" -Method Get
    Assert-Step "Unauthenticated access blocked" $false "Expected 401 or 403, but request succeeded"
} catch {
    $sc = $_.Exception.Response.StatusCode.value__
    Assert-Step "Unauthenticated access blocked" ($sc -eq 401 -or $sc -eq 403) "Correctly blocked (HTTP $sc)"
}

# ----------------------------------------------------
# SUMMARY
# ----------------------------------------------------
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "                TEST EXECUTION SUMMARY                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Total Tests Passed : $passed" -ForegroundColor Green
Write-Host "Total Tests Failed : $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -gt 0) {
    Write-Host "`nFailed Tests List:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "`nALL TEST SCENARIOS PASSED WITH ZERO FAILURES!" -ForegroundColor Green
    exit 0
}
