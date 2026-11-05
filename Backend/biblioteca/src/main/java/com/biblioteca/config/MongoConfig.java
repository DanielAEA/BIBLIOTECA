package com.biblioteca.config;

import com.mongodb.WriteConcern;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsCustomizer() {
        return clientSettingsBuilder -> {
            clientSettingsBuilder.writeConcern(WriteConcern.MAJORITY);
        };
    }
}