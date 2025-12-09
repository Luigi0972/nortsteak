FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
# Asegura permisos de ejecución para mvnw (en repos clonados desde Windows pierde el bit +x)
RUN chmod +x mvnw
# Empaqueta sin tests para acelerar en Railway
RUN ./mvnw -DskipTests package
# Ajusta el nombre del jar si cambia la versión en pom.xml
CMD ["java", "-jar", "target/nortsteak-0.0.1-SNAPSHOT.jar"]

