package com.myproject.studynow.service.impl;

import com.myproject.studynow.dto.StudySessionDTO;
import com.myproject.studynow.entity.*;
import com.myproject.studynow.repository.StudySessionRepository;
import com.myproject.studynow.repository.SubjectRepository;
import com.myproject.studynow.repository.FreeTimeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.myproject.studynow.service.StudySessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudySessionServiceImpl implements StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final SubjectRepository subjectRepository;
    private final FreeTimeRepository freeTimeRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${GEMINI_KEY}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://generativelanguage.googleapis.com/v1beta/openai/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.model:gemini-2.0-flash}")
    private String openaiModel;

    public List<StudySession> getStudySessionByUserId(Long userId) {
        return studySessionRepository.findByUserId(userId);
    }

    @Override
    public List<StudySession> getStudySessionThisWeek(Long userId) {
        LocalDate today = LocalDate.now();

        // Tìm ngày đầu tuần (thứ 2)
        LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate sunday = monday.plusDays(6);

        LocalDateTime startOfWeek = monday.atStartOfDay();
        LocalDateTime endOfWeek = sunday.atTime(LocalTime.MAX);

        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startOfWeek, endOfWeek);
    }

    /**
     * Tạo study sessions cho user dựa trên subjects và free times
     */
    @Transactional
    public List<StudySession> generateStudySessionsForUser(Long userId, int daysAhead) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime future = now.plusDays(daysAhead);
            studySessionRepository.deleteByUserIdAndTimeRange(userId, now, future);
            // Lấy dữ liệu từ database
            List<Subject> subjects = subjectRepository.findByUserId(userId);
            List<FreeTime> freeTimes = freeTimeRepository.findByUserId(userId);

            if (subjects.isEmpty() || freeTimes.isEmpty()) {
                log.warn("No subjects or free times found for user {}", userId);
                return Collections.emptyList();
            }

            // Tạo prompt cho OpenAI
            String prompt = buildPromptForOpenAI(subjects, freeTimes, daysAhead);

            // Gọi OpenAI API
            String openaiResponse = callOpenAIAPI(prompt);

            // Parse response và tạo study sessions
            List<StudySession> studySessions = parseOpenAIResponseAndCreateSessions(
                    openaiResponse, subjects, freeTimes, userId);

            // Lưu vào database
            return studySessionRepository.saveAll(studySessions);

        } catch (Exception e) {
            log.error("Error generating study sessions for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to generate study sessions", e);
        }
    }

    /**
     * Xây dựng prompt cho OpenAI API
     */
    private String buildPromptForOpenAI(List<Subject> subjects, List<FreeTime> freeTimes, int daysAhead) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are a smart AI assistant that helps students create study schedules.\n\n");

        // Given
        prompt.append("Given:\n");
        prompt.append("- A list of subjects (name");
        if (subjects.stream().anyMatch(s -> s.getFinishDay() != null)) {
            prompt.append(", optional finishDate");
        }
        prompt.append(")\n");
        prompt.append("- A list of free time slots (dayOfWeek 1-7, start, end)\n\n");

        // Subject list
        prompt.append("SUBJECTS:\n");
        for (Subject subject : subjects) {
            prompt.append(String.format("- %s", subject.getName()));
            if (subject.getFinishDay() != null) {
                prompt.append(", FinishBy: ").append(subject.getFinishDay().toString());
            }
            prompt.append("\n");
        }

        // Free time list
        prompt.append("\nFREE TIME:\n");
        for (FreeTime freeTime : freeTimes) {
            String dayName = getDayName(freeTime.getDayOfWeek());
            prompt.append(String.format("- %s (%d): %s - %s\n",
                    dayName,
                    freeTime.getDayOfWeek(),
                    freeTime.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                    freeTime.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"))));
        }

        // Constraints
        prompt.append("\nConstraints:\n");
        prompt.append(String.format("- Plan sessions for the next %d days\n", daysAhead));
        prompt.append("- Prioritize subjects fairly\n");
        prompt.append("- Use only the given free time slots\n");
        prompt.append("- Each session: 30–120 minutes\n\n");

        // Output
        prompt.append("Respond only with valid JSON like this:\n");
        prompt.append("{\n");
        prompt.append("  \"sessions\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"subjectName\": \"...\",\n");
        prompt.append("      \"dayOfWeek\": 1-7,\n");
        prompt.append("      \"startTime\": \"HH:mm\",\n");
        prompt.append("      \"endTime\": \"HH:mm\",\n");
        prompt.append("      \"duration\": int,\n");
        prompt.append("      \"description\": \"...\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}");

        return prompt.toString();
    }



    /**
     * Gọi OpenAI API
     */
    private String callOpenAIAPI(String prompt) throws Exception {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + openaiApiKey);
            headers.set("Content-Type", "application/json");

            // Tạo request body cho OpenAI
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2048);
            requestBody.put("top_p", 0.8);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    openaiApiUrl,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Parse OpenAI response
                JsonNode responseNode = objectMapper.readTree(response.getBody());
                JsonNode choicesNode = responseNode.get("choices");

                if (choicesNode != null && choicesNode.isArray() && choicesNode.size() > 0) {
                    JsonNode firstChoice = choicesNode.get(0);
                    JsonNode messageNode = firstChoice.get("message");
                    if (messageNode != null) {
                        return messageNode.get("content").asText();
                    }
                }

                throw new RuntimeException("Invalid response format from OpenAI API");
            } else {
                throw new RuntimeException("Failed to get response from OpenAI API: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            throw new RuntimeException("Failed to call OpenAI API", e);
        }
    }

    /**
     * Parse response từ OpenAI và tạo StudySession objects
     */
    private List<StudySession> parseOpenAIResponseAndCreateSessions(
            String openaiResponse, List<Subject> subjects, List<FreeTime> freeTimes, Long userId) {

        List<StudySession> studySessions = new ArrayList<>();

        try {
            // Clean response (remove markdown if any)
            String cleanResponse = openaiResponse.trim();
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
            log.error("Error parsing OpenAI response: {}", e.getMessage());
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
     * Tạo sessions cơ bản khi OpenAI fail
     */
    private List<StudySession> createFallbackSessions(List<Subject> subjects, List<FreeTime> freeTimes, Long userId) {
        List<StudySession> sessions = new ArrayList<>();

        if (freeTimes.isEmpty() || subjects.isEmpty()) return sessions;

        int defaultSessionDurationMinutes = 60;

        int freeTimeIndex = 0;

        for (Subject subject : subjects) {
            // Mặc định tạo 2 session cho mỗi môn
            int sessionsPerSubject = 2;

            for (int i = 0; i < sessionsPerSubject; i++) {
                FreeTime freeTime = freeTimes.get(freeTimeIndex % freeTimes.size());

                // Tìm ngày gần nhất tương ứng với dayOfWeek
                LocalDateTime startDateTime = getNextDateTimeForDay(
                        freeTime.getDayOfWeek(),
                        freeTime.getStartTime().toString()
                );

                LocalDateTime endDateTime = startDateTime.plusMinutes(defaultSessionDurationMinutes);

                // Nếu endTime vượt quá freeTime thì bỏ qua
                if (endDateTime.toLocalTime().isAfter(freeTime.getEndTime())) {
                    continue;
                }

                StudySession session = new StudySession();
                session.setUser(subject.getUser());
                session.setSubject(subject);
                session.setStartTime(startDateTime);
                session.setEndTime(endDateTime);
                session.setDuration(defaultSessionDurationMinutes);
                session.setCompleted(false);
                session.setCreatedAt(LocalDateTime.now());

                sessions.add(session);
                freeTimeIndex++;
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