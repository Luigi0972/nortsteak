FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
# Da permisos de ejecución al wrapper de Maven
RUN chmod +x mvnw
# Empaqueta sin tests para acelerar el build en Railway
RUN ./mvnw -DskipTests package
# Ajusta el nombre del jar si cambia la versión en pom.xml
CMD ["java", "-jar", "target/nortsteak-0.0.1-SNAPSHOT.jar"]

