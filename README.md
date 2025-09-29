📌 Práctico Integrador – Docker + IoT + App Móvil


📖 Introducción

Este proyecto implementa una mini-plataforma integrada con Docker Compose, que conecta servicios de backend, automatización de flujos, una aplicación móvil y un dispositivo IoT ESP8266.

El sistema permite controlar un LED (ON/OFF) desde la app móvil, registrar los eventos en una base de datos MySQL y reflejar la acción físicamente en el microcontrolador.


🎯 Objetivos

Desplegar una infraestructura completa mediante Docker Compose.

Integrar servicios clave:

Mosquitto (MQTT broker).

MySQL + phpMyAdmin (base de datos y gestión).

n8n (automatización de flujos).

Flask + Nginx (exposición de datos en tabla HTML).

Portainer (gestión de contenedores).

Desarrollar una app móvil .NET MAUI Blazor Hybrid que envíe órdenes ON/OFF.

Programar un ESP8266 con código en Arduino IDE para controlar un LED real.

Validar los dos flujos implementados en n8n:

MQTT Workflow

Webhook Workflow


🐳 Servicios en contenedores

Mosquitto: broker MQTT (puerto 1883).

MySQL 8.0: base de datos con tabla orders.

phpMyAdmin: interfaz de administración web (puerto 8081).

n8n: orquestador de flujos (puerto 5678).

Flask: aplicación Python que muestra datos en tabla HTML.

Nginx: reverse proxy para exponer Flask (puerto 8080).

Portainer: UI para gestión de contenedores (puerto 9443).


⚙️ Requisitos

Docker y Docker Compose

Windows/Linux/Mac con soporte de contenedores

Cliente MQTT (ej: MQTTX, MQTT Studio, MQTT Explorer)

Visual Studio 2022 (para la App MAUI)

Arduino IDE (para ESP8266)


🚀 Puesta en marcha

Cambiar las variables de entorno:

Editar .env según necesidad (usuarios, contraseñas, puertos).


Levantar la plataforma:

docker compose up -d --build


Verificar estado:

docker compose ps


🌐 Endpoints

Flask vía Nginx → http://localhost:8080/app/tabla

n8n → http://localhost:5678

phpMyAdmin → http://localhost:8081

Portainer → https://localhost:9443


🔄 Workflows en n8n

1. Workflow MQTT

Suscribe a tópico lab/g1/req/led.

Valida campos recibidos.

Si válido → inserta en MySQL.

Si inválido → no inserta.

2. Workflow Webhook

Expone endpoint:

http://localhost:5678/webhook-test/led_control

Recibe peticiones HTTP desde la app móvil.

Inserta datos en MySQL y responde JSON con ok:true y detalle de inserción.


📱 App móvil – .NET MAUI Blazor Hybrid

Pantalla principal con botón ON/OFF.

Envía el comando a n8n.

Registra acción en MySQL y enciende/apaga LED en ESP8266 vía MQTT.


🔌 ESP8266 con LED

Código desarrollado en Arduino IDE.

Se conecta al broker MQTT.

Escucha mensajes ON/OFF y controla el LED físico en el pin definido.


🧪 Pruebas de funcionamiento

Prueba MQTT con MQTT Studio:

Suscribirse a lab/g1/req/led.

Publicar en lab/g1/req/led con payload JSON válido.

Verificar respuesta ok:true y registro en BD.

Prueba Webhook con URL:

http://localhost:5678/webhook-test/led_control?command=ON
http://localhost:5678/webhook-test/led_control?command=OFF

Verificación:

ON/OFF: phpMyAdmin o Flask → registros insertados.



📊 Capturas sugeridas

Docker Compose levantado (docker compose ps).

Interfaz de Portainer mostrando contenedores.

n8n con ambos workflows.

phpMyAdmin con tabla orders.

Flask mostrando tabla en HTML.

App móvil ON/OFF.

LED encendido en ESP8266.


📝 Conclusión

Este trabajo integrador permitió comprobar cómo la combinación de contenedores Docker, automatización de flujos, bases de datos, aplicaciones móviles y hardware IoT puede dar lugar a una solución funcional, escalable y práctica.
La plataforma desarrollada constituye un ejemplo concreto de ecosistema IoT-Web-Mobile, donde la comunicación en tiempo real y la persistencia de datos se logran de forma coordinada y eficiente.