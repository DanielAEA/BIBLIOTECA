package com.biblioteca.service;

import org.springframework.lang.NonNull;
 
public interface QrService {
    byte[] generarQr(@NonNull String id, boolean esEjemplar);
}
