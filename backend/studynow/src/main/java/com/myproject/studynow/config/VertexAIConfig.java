package com.myproject.studynow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VertexAIConfig {

    @Value("${PROJECT_ID}")
    private String projectId;

    @Value("${LOCATION_AI}")
    private String location;

    @Value("${MODAL_AI}")
    private String modelName;

    // Getters
    public String getProjectId() {
        return projectId;
    }

    public String getLocation() {
        return location;
    }

    public String getModelName() {
        return modelName;
    }
}