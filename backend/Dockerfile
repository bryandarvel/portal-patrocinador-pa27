FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src
RUN sh ./mvnw -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/portal-patrocinador-0.0.1-SNAPSHOT.jar portal.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/portal.jar"]
