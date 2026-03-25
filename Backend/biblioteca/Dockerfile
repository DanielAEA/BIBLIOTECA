# ============================================
# Etapa 1: Compilar el proyecto con Maven
# ============================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copiar archivos de configuración de Maven primero (para cachear dependencias)
COPY pom.xml .

# Descargar dependencias (se cachea si pom.xml no cambia)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Compilar el proyecto (sin ejecutar tests)
RUN mvn clean package -DskipTests -B

# ============================================
# Etapa 2: Ejecutar la aplicación
# ============================================
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copiar el JAR compilado desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Crear directorio para uploads
RUN mkdir -p /app/uploads

# Exponer puerto
EXPOSE 8080

# Ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
