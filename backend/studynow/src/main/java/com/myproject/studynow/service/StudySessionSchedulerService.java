package com.myproject.studynow.service;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.*;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.myproject.studynow.entity.*;
import com.myproject.studynow.repository.StudySessionRepository;
import com.myproject.studynow.repository.SubjectRepository;
import com.myproject.studynow.repository.FreeTimeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudySessionSchedulerService {

    private final StudySessionRepository studySessionRepository;
    private final SubjectRepository subjectRepository;
    private final FreeTimeRepository freeTimeRepository;
    private final ObjectMapper objectMapper;

    @Value("${PROJECT_ID}")
    private String projectId;

    @Value("${LOCATION_AI}")
    private String location;

    @Value("${MODAL_AI}")
    private String modelName;

    /**
     * Tạo study sessions cho user dựa trên subjects và free times
     */
    @Transactional
    public List<StudySession> generateStudySessionsForUser(Long userId, int daysAhead) {
        try {
            // Lấy dữ liệu từ database
            List<Subject> subjects = subjectRepository.findByUserId(userId);
            List<FreeTime> freeTimes = freeTimeRepository.findByUserId(userId);

            if (subjects.isEmpty() || freeTimes.isEmpty()) {
                log.warn("No subjects or free times found for user {}", userId);
                return Collections.emptyList();
            }

            // Tạo prompt cho Gemini
            String prompt = buildPromptForGemini(subjects, freeTimes, daysAhead);

            // Gọi Gemini API
            String geminiResponse = callGeminiAPI(prompt);

            // Parse response và tạo study sessions
            List<StudySession> studySessions = parseGeminiResponseAndCreateSessions(
                    geminiResponse, subjects, freeTimes, userId);

            // Lưu vào database
            return studySessionRepository.saveAll(studySessions);

        } catch (Exception e) {
            log.error("Error generating study sessions for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to generate study sessions", e);
        }
    }

    /**
     * Xây dựng prompt cho Gemini API
     */
    private String buildPromptForGemini(List<Subject> subjects, List<FreeTime> freeTimes, int daysAhead) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an AI specialized in study planning. ");
        prompt.append("Generate an optimized study schedule based on the following:\n\n");

        prompt.append("SUBJECTS:\n");
        for (Subject subject : subjects) {
            prompt.append(String.format("- %s: %s, Priority: %s, WeeklyHours: %d",
                    subject.getName(),
                    subject.getDescription() != null ? subject.getDescription() : "No description",
                    subject.getPriority().name(),
                    subject.getWeeklyHours()));
            if (subject.getFinishDay() != null) {
                prompt.append(", FinishBy: " + subject.getFinishDay().toString());
            }
            prompt.append("\n");
        }

        prompt.append("\nFREE TIME:\n");
        for (FreeTime freeTime : freeTimes) {
            String dayName = getDayName(freeTime.getDayOfWeek());
            prompt.append(String.format("- %s: %s - %s\n",
                    dayName,
                    freeTime.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                    freeTime.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"))));
        }

        prompt.append("\nREQUIREMENTS:\n");
        prompt.append(String.format("- Schedule for the next %d days\n", daysAhead));
        prompt.append("- Prioritize HIGH priority subjects\n");
        prompt.append("- Distribute study time evenly across days\n");
        prompt.append("- Match total weekly hours per subject\n");
        prompt.append("- Only use available free time slots\n");
        prompt.append("- Each session should be 30–120 minutes\n");
        prompt.append("- Avoid very long study days\n\n");

        prompt.append("OUTPUT FORMAT (JSON only):\n");
        prompt.append("{\n");
        prompt.append("  \"sessions\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"subjectName\": \"Subject name\",\n");
        prompt.append("      \"dayOfWeek\": 1-7,\n");
        prompt.append("      \"startTime\": \"HH:mm\",\n");
        prompt.append("      \"endTime\": \"HH:mm\",\n");
        prompt.append("      \"duration\": 60,\n");
        prompt.append("      \"description\": \"Short note\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n\n");
        prompt.append("Return JSON only. No explanation or comments.");

        return prompt.toString();
    }


    /**
     * Gọi Gemini API
     */
    private String callGeminiAPI(String prompt) throws Exception {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {
            GenerativeModel model = new GenerativeModel(modelName, vertexAI);

            // Cấu hình tùy chọn (nếu muốn)
            model = model.withGenerationConfig(
                    GenerationConfig.newBuilder()
                            .setTemperature(0.7f)
                            .setTopP(0.8f)
                            .setMaxOutputTokens(2048)
                            .build()
            );

            // Dùng Content API mới
            Content content = Content.newBuilder()
                    .addParts(Part.newBuilder().setText(prompt).build())
                    .build();

            GenerateContentResponse response = model.generateContent(content);

            if (response.getCandidatesCount() > 0) {
                return response.getCandidates(0).getContent().getParts(0).getText();
            } else {
                throw new RuntimeException("No response from Gemini API");
            }
        }
    }


    /**
     * Parse response từ Gemini và tạo StudySession objects
     */
    private List<StudySession> parseGeminiResponseAndCreateSessions(
            String geminiResponse, List<Subject> subjects, List<FreeTime> freeTimes, Long userId) {

        List<StudySession> studySessions = new ArrayList<>();

        try {
            // Clean response (remove markdown if any)
            String cleanResponse = geminiResponse.trim();
            if (cleanResponse.startsWith("```json")) {
                cleanResponse = cleanResponse.substring(7);
            }
            if (cleanResponse.endsWith("```")) {
                cleanResponse = cleanResponse.substring(0, cleanResponse.length() - 3);
            }

            JsonNode rootNode = objectMapper.readTree(cleanResponse);
            JsonNode sessionsNode = rootNode.get("sessions");

            if (sessionsNode != null && sessionsNode.isArray()) {
                for (JsonNode sessionNode : sessionsNode) {
                    StudySession session = createStudySessionFromJson(sessionNode, subjects, userId);
                    if (session != null) {
                        studySessions.add(session);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            // Fallback: tạo sessions cơ bản
            studySessions = createFallbackSessions(subjects, freeTimes, userId);
        }

        return studySessions;
    }

    /**
     * Tạo StudySession từ JSON node
     */
    private StudySession createStudySessionFromJson(JsonNode sessionNode, List<Subject> subjects, Long userId) {
        try {
            String subjectName = sessionNode.get("subjectName").asText();
            int dayOfWeek = sessionNode.get("dayOfWeek").asInt();
            String startTimeStr = sessionNode.get("startTime").asText();
            String endTimeStr = sessionNode.get("endTime").asText();
            int duration = sessionNode.get("duration").asInt();

            // Tìm subject
            Subject subject = subjects.stream()
                    .filter(s -> s.getName().equalsIgnoreCase(subjectName))
                    .findFirst()
                    .orElse(null);

            if (subject == null) {
                log.warn("Subject not found: {}", subjectName);
                return null;
            }

            // Tạo datetime cho session
            LocalDateTime startDateTime = getNextDateTimeForDay(dayOfWeek, startTimeStr);
            LocalDateTime endDateTime = getNextDateTimeForDay(dayOfWeek, endTimeStr);

            StudySession session = new StudySession();
            session.setUser(subject.getUser());
            session.setSubject(subject);
            session.setStartTime(startDateTime);
            session.setEndTime(endDateTime);
            session.setDuration(duration);
            session.setCompleted(false);
            session.setCreatedAt(LocalDateTime.now());

            return session;

        } catch (Exception e) {
            log.error("Error creating study session from JSON: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Tạo sessions cơ bản khi Gemini fail
     */
    private List<StudySession> createFallbackSessions(List<Subject> subjects, List<FreeTime> freeTimes, Long userId) {
        List<StudySession> sessions = new ArrayList<>();

        // Simple algorithm: distribute subjects across free times
        for (Subject subject : subjects) {
            int hoursNeeded = subject.getWeeklyHours();
            int sessionsCount = Math.max(1, hoursNeeded / 2); // 2 hours per session

            for (int i = 0; i < sessionsCount && i < freeTimes.size(); i++) {
                FreeTime freeTime = freeTimes.get(i % freeTimes.size());

                LocalDateTime startDateTime = getNextDateTimeForDay(
                        freeTime.getDayOfWeek(),
                        freeTime.getStartTime().toString());

                LocalDateTime endDateTime = startDateTime.plusHours(2);

                StudySession session = new StudySession();
                session.setUser(subject.getUser());
                session.setSubject(subject);
                session.setStartTime(startDateTime);
                session.setEndTime(endDateTime);
                session.setDuration(120);
                session.setCompleted(false);
                session.setCreatedAt(LocalDateTime.now());

                sessions.add(session);
            }
        }

        return sessions;
    }

    /**
     * Utility methods
     */
    private String getDayName(int dayOfWeek) {
        String[] days = {"", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        return days[dayOfWeek];
    }

    private LocalDateTime getNextDateTimeForDay(int dayOfWeek, String timeStr) {
        LocalTime time = LocalTime.parse(timeStr);
        LocalDateTime now = LocalDateTime.now();

        // Find next occurrence of this day
        DayOfWeek targetDay = DayOfWeek.of(dayOfWeek);
        LocalDateTime target = now.with(targetDay).with(time);

        if (target.isBefore(now)) {
            target = target.plusWeeks(1);
        }

        return target;
    }
}