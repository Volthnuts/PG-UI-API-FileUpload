package com.somapa.fileupload.services;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

public interface excelService {
    List<Map<String, String>> parseExcel(MultipartFile file) throws Exception;
    ByteArrayInputStream writeExcel(List<Map<String, String>> data) throws Exception;
}
