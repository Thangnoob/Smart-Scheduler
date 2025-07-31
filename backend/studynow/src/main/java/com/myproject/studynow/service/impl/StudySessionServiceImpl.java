package com.myproject.studynow.service.impl;

import com.myproject.studynow.dto.*;
import com.myproject.studynow.entity.*;
import com.myproject.studynow.exception.StudySessionNotFoundException;
import com.myproject.studynow.repository.StudySessionRepository;
import com.myproject.studynow.repository.SubjectRepository;
import com.myproject.studynow.repository.FreeTimeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.myproject.studynow.repository.UserRepository;
import com.myproject.studynow.service.StudySessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

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
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${GEMINI_KEY}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://generativelanguage.googleapis.com/v1beta/openai/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.model:gemini-2.0-flash}")
    private String openaiModel;

    @Override
    public StudySession createStudySession(Long userId, StudySessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        StudySession session = new StudySession();
        session.setUser(user);
        session.setSubject(subject);
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setDuration(request.getDuration());
        session.setCompleted(false);

        return studySessionRepository.save(session);
    }

    @Override
    public StudySession updateStudySession(Long id, Long userId, StudySessionRequest request) {
        StudySession existingSession = studySessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudySession not found"));

        if (!existingSession.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        existingSession.setSubject(subject);
        existingSession.setStartTime(request.getStartTime());
        existingSession.setEndTime(request.getEndTime());
        existingSession.setDuration(request.getDuration());

        return studySessionRepository.save(existingSession);
    }

    @Override
    public void deleteStudySession(Long id, Long userId) {
        StudySession existingSession = studySessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudySession not found"));

        if (!existingSession.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        studySessionRepository.delete(existingSession);
    }

    @Override
    public StudySession getStudySessionByUserAndId(Long userId, Long sessionId) {
        return studySessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("StudySession not found or access denied"));
    }

    @Override
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

    @Override
    public List<StudySession> getStudySessionsForWeek(Long userId, LocalDate baseDate, int offset) {
        LocalDate startOfWeek = baseDate.with(DayOfWeek.MONDAY).plusWeeks(offset);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        LocalDateTime startDateTime = startOfWeek.atStartOfDay();
        LocalDateTime endDateTime = endOfWeek.atTime(23, 59, 59);

        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startDateTime, endDateTime);
    }

    public List<StudySession> getTodayStudySessions(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay(); // 00:00 hôm nay
        LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59); // 23:59:59 hôm nay

        return studySessionRepository.findByUserIdAndStartTimeBetween(userId, startOfDay, endOfDay);
    }


    @Override
    public List<StudySession> getCompletedSessionsByUser(Long userId) {
        return studySessionRepository.findByUserIdAndIsCompletedTrue(userId);
    }


    @Override
    public PomodoroStartResponse startSession(Long sessionId, Long userId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new StudySessionNotFoundException("Study session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this session");
        }

        if (session.isCompleted()) {
            throw new RuntimeException("This session is already completed");
        }

        if (LocalDateTime.now().isAfter(session.getEndTime())) {
            session.setCompleted(true);
            studySessionRepository.save(session);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phiên học đã hết hạn, không thể bắt đầu");
        }

        int duration = session.getDuration(); // tổng thời lượng phiên học
        int pomodoroDuration = 25; // mỗi Pomodoro 25 phút
        int shortBreak = 5;        // nghỉ ngắn 5 phút
        int longBreak = 15;        // nghỉ dài nếu cần (chưa áp dụng)


        int totalPomodoros = 0;
        int totalUsedMinutes = 0;

        while (true) {
            int nextPomodoroMinutes = (totalPomodoros + 1) * pomodoroDuration;
            int nextBreakMinutes = totalPomodoros * shortBreak; // break sau mỗi pomodoro trừ cái cuối
            int nextTotal = nextPomodoroMinutes + nextBreakMinutes;

            if (nextTotal <= duration) {
                totalPomodoros++;
                totalUsedMinutes = nextTotal;
            } else {
                break;
            }
        }

//        if (totalPomodoros == 0) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
//                    "Thời lượng quá ngắn để áp dụng Pomodoro (tối thiểu khoảng 25 phút)");
//        }

        int remainingMinutes = duration - totalUsedMinutes;

        return new PomodoroStartResponse(
                session.getId(),
                session.getSubject().getName(),
                duration,
                pomodoroDuration,
                shortBreak,
                longBreak,
                totalPomodoros,
                remainingMinutes
        );

    }


    @Override
    public CompleteSessionResponse completeSession(Long sessionId, Long userId, CompleteSessionRequest request) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Study session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this session");
        }

        session.setCompleted(true);
        session.setActualMinutes(request.getActualMinutes());
        session.setCompletedPomodoros(request.getCompletedPomodoros());
        studySessionRepository.save(session);

        double efficiency = (request.getActualMinutes() * 100.0) / session.getDuration();

        return new CompleteSessionResponse(
                "Study session completed",
                session.getId(),
                session.getDuration(),
                session.getActualMinutes(),
                session.getCompletedPomodoros(),
                efficiency
        );
    }


    /**
     * Tạo study sessions cho user dựa trên subjects và free times
     */
    @Override
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