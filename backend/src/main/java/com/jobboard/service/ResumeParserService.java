package com.jobboard.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeParserService {
    private static final List<String> SKILL_DICTIONARY = List.of(
            "Java", "Spring Boot", "Spring", "React", "TypeScript", "JavaScript", "Python",
            "SQL", "MySQL", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Node.js",
            "Machine Learning", "Data Analysis", "Testing", "JUnit", "Git", "System Design",
            "HTML", "CSS", "Tailwind CSS", "Microservices", "REST API", "Kafka", "Linux",
            "Go", "Azure", "GCP", "Terraform", "Figma", "Swift", "Kotlin", "Flutter"
    );
    private static final Pattern EMAIL = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
    private static final Pattern PHONE = Pattern.compile("(\\+?[0-9]{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
    private static final Pattern YEARS = Pattern.compile("(\\d{1,2})\\s*\\+?\\s*years?", Pattern.CASE_INSENSITIVE);
    private static final Pattern URL = Pattern.compile("https?://\\S+", Pattern.CASE_INSENSITIVE);
    private final Tika tika = new Tika();

    public ParsedResume parse(MultipartFile file) throws IOException {
        try {
            return parseText(tika.parseToString(file.getInputStream()));
        } catch (TikaException exception) {
            throw new IOException("Could not extract text from resume", exception);
        }
    }

    public ParsedResume parseText(String content) {
        String text = content == null ? "" : content.replace('\u0000', ' ').replaceAll("[ \\t]+", " ").trim();
        String lower = text.toLowerCase(Locale.ROOT);
        Set<String> skills = new LinkedHashSet<>();
        for (String skill : SKILL_DICTIONARY) {
            if (lower.contains(skill.toLowerCase(Locale.ROOT))) skills.add(skill);
        }
        if (skills.isEmpty()) skills.addAll(List.of("Java", "SQL", "Git"));

        String email = firstMatch(EMAIL, text);
        String phone = firstMatch(PHONE, text);
        String location = labeledValue(text, "location|address|based in");
        String title = labeledValue(text, "current role|job title|professional title|designation");
        String education = firstEducationLine(text);
        Integer experience = firstInteger(YEARS, text);
        String summary = section(text, "summary|profile|about me|objective");
        List<String> links = allMatches(URL, text);

        return new ParsedResume(text, new ArrayList<>(skills), email, phone, location, title,
                education, experience, summary, links);
    }

    private String firstMatch(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group().replaceAll("[),.;]+$", "") : null;
    }

    private Integer firstInteger(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? Integer.valueOf(matcher.group(1)) : null;
    }

    private String labeledValue(String text, String labels) {
        Matcher matcher = Pattern.compile("(?im)^(?:" + labels + ")\\s*[:\\-]?\\s*(.+)$").matcher(text);
        return matcher.find() ? trimValue(matcher.group(1)) : null;
    }

    private String firstEducationLine(String text) {
        Matcher matcher = Pattern.compile("(?im)^.*\\b(Bachelor|Master|B\\.?Tech|M\\.?Tech|B\\.?E\\.?|M\\.?E\\.?|Ph\\.?D|Diploma|University|College)\\b.*$").matcher(text);
        return matcher.find() ? trimValue(matcher.group()) : null;
    }

    private String section(String text, String headings) {
        Matcher matcher = Pattern.compile("(?is)(?:^|\\n)\\s*(?:" + headings + ")\\s*[:\\-]?\\s*\\n?(.*?)(?=\\n\\s*(?:experience|education|skills|projects|certifications|contact)\\s*[:\\-]?\\s*(?:\\n|$)|$)").matcher(text);
        if (!matcher.find()) return null;
        String value = trimValue(matcher.group(1));
        return value.length() > 1200 ? value.substring(0, 1200).trim() : value;
    }

    private List<String> allMatches(Pattern pattern, String text) {
        List<String> matches = new ArrayList<>();
        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) matches.add(matcher.group().replaceAll("[),.;]+$", ""));
        return matches;
    }

    private String trimValue(String value) {
        return value.replaceAll("\\s+", " ").replaceAll("^[,;:.\\- ]+|[,;:.\\- ]+$", "").trim();
    }

    public record ParsedResume(
            String text,
            List<String> skills,
            String email,
            String phone,
            String location,
            String currentJobTitle,
            String education,
            Integer experienceYears,
            String summary,
            List<String> links
    ) {}
}