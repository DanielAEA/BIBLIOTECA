package com.biblioteca.service.impl;

import com.biblioteca.service.QrService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;

@Service
public class QrServiceImpl implements QrService {

    private static final Logger logger = LoggerFactory.getLogger(QrServiceImpl.class);

    @org.springframework.beans.factory.annotation.Value("${app.base.url}")
    private String fallbackBaseUrl;

    private String getNgrokUrl() {
        try {
            String ngrokHost = System.getenv("NGROK_API_HOST");
            if (ngrokHost == null || ngrokHost.isEmpty()) {
                ngrokHost = "localhost";
            }
            RestTemplate rt = new RestTemplate();
            // Intentamos obtener los túneles de ngrok desde su API (local o de red Docker)
            String urlApi = "http://" + ngrokHost + ":4040/api/tunnels";
            String json = rt.getForObject(urlApi, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode tunnels = root.get("tunnels");
            if (tunnels != null && tunnels.isArray()) {
                for (JsonNode tunnel : tunnels) {
                    String url = tunnel.get("public_url").asText();
                    if (url.startsWith("https")) {
                        return url;
                    }
                }
            }
        } catch (Exception e) {
            // Ngrok no detectado o error
            logger.warn("[WARN] No se pudo obtener la URL de ngrok: {}. Usando fallback: {}", e.getMessage(), fallbackBaseUrl);
        }
        return fallbackBaseUrl;
    }

    @Override
    public byte[] generarQr(@NonNull String id, boolean esEjemplar) {
        try {
            String baseUrl = getNgrokUrl();
            if (baseUrl == null || baseUrl.isEmpty()) {
                baseUrl = fallbackBaseUrl;
            }
            if (baseUrl.endsWith("/")) {
                baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
            }

            // Construir la URL según si es un libro o un ejemplar
            String path = esEjemplar ? "/solicitar-ejemplar/" : "/solicitar/";
            String text = baseUrl + path + id;

            logger.info("[INFO] Generando QR para {} ID: {} con URL: {}", (esEjemplar ? "EJEMPLAR" : "LIBRO"), id, text);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            
            return pngOutputStream.toByteArray();

        } catch (Exception e) {
            logger.error("Error critico al generar QR para ID {}: {}", id, e.getMessage());
            // Fallback: Generar un QR con texto de error para no devolver null y evitar 404
            try {
                QRCodeWriter qrCodeWriter = new QRCodeWriter();
                BitMatrix bitMatrix = qrCodeWriter.encode("Error generating QR", BarcodeFormat.QR_CODE, 300, 300);
                ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
                return pngOutputStream.toByteArray();
            } catch (Exception e2) {
                return null;
            }
        }
    }
}
