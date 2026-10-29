# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir ./uploads
ENV APP_BASE_URL=http://localhost:8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
