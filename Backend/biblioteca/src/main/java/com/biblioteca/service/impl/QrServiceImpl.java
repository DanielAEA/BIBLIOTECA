package com.biblioteca.service.impl;

import com.biblioteca.service.QrService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class QrServiceImpl implements QrService {

    private static final Logger logger = LoggerFactory.getLogger(QrServiceImpl.class);

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public byte[] generarQr(@NonNull String id, boolean esEjemplar) {
        try {
            String url = baseUrl.endsWith("/")
                    ? baseUrl.substring(0, baseUrl.length() - 1)
                    : baseUrl;

            String path = esEjemplar ? "/solicitar-ejemplar/" : "/solicitar/";
            String text = url + path + id;

            logger.info("[QR] Generando para {} ID: {} -> {}",
                    (esEjemplar ? "EJEMPLAR" : "LIBRO"), id, text);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 350, 300);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

            return pngOutputStream.toByteArray();

        } catch (Exception e) {
            logger.error("Error al generar QR: {}", e.getMessage());
            return null;
        }
    }
}