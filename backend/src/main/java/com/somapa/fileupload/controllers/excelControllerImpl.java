package com.somapa.fileupload.controllers;

import com.somapa.fileupload.services.excelServiceImpl;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController // นี่คือ Controller
@CrossOrigin(origins = "*") // เปิด cors ให้ทุกที่เรียกใช้ได้
@RequestMapping("/api/v1/excel")
public class excelControllerImpl implements excelController { // บอกว่า "ฉันจะทำตามสัญญาของ excelController"

    private final excelServiceImpl excelServiceImp;
    public excelControllerImpl(excelServiceImpl excelServiceImpInController) {
        this.excelServiceImp = excelServiceImpInController;
    }

    @Override
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {

        // เช็คนามสกุลไฟล์
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only .xlsx files are allowed.");
        }

        try {
            List<Map<String, String>> data = excelServiceImp.parseExcel(file); // เรียกใช้ service และส่งไฟล์ไป

            // ส่ง 200 OK พร้อมข้อมูลกลับไป
            return ResponseEntity.ok(data);

        } catch (RuntimeException e) {
            // ส่ง 400 Bad Request พร้อมข้อความ "Row XXX Invalid..."
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Error");
        }
    }

    @Override
    public ResponseEntity<Resource> download(
            @RequestBody List<Map<String, String>> data,
            @RequestParam(value = "filename", defaultValue = "export.xlsx") String fileName // รับชื่อไฟล์จาก URL
    ) throws Exception {

        ByteArrayInputStream in = excelServiceImp.writeExcel(data);

        // ตรวจสอบนามสกุลไฟล์เผื่อไว้
        if (!fileName.toLowerCase().endsWith(".xlsx")) {
            fileName += ".xlsx";
        }

        // จัดการ Encoding เพื่อรองรับภาษาไทย
        String encodedFileName = UriUtils.encode(fileName, StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}