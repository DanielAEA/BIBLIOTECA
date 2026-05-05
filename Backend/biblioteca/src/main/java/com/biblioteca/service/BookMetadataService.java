package com.biblioteca.service;

import java.util.Map;

public interface BookMetadataService {
    Map<String, Object> fetchMetadataByIsbn(String isbn);
}
