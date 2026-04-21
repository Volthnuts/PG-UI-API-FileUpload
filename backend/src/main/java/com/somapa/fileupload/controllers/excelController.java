package com.somapa.fileupload.controllers;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

public interface excelController {
    @PostMapping("/upload")
    ResponseEntity<?> upload(MultipartFile file) throws Exception;

    @PostMapping("/download")
    ResponseEntity<Resource> download(
            @RequestBody List<Map<String, String>> data,
            @RequestParam("filename") String fileName // เพิ่มตรงนี้
    ) throws Exception;
}
