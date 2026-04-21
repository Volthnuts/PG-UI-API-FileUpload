package com.somapa.fileupload.services;

import com.somapa.fileupload.validators.excelValidator;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class excelServiceImpl implements excelService {

    @Autowired
    private excelValidator excelValidator;

    // แกะไฟล์ excel
    public List<Map<String, String>> parseExcel(MultipartFile file) throws Exception {

        // ***--- เตรียมไฟล์ ---***
        // ตั้งตัวแปรที่จะเก็บชุดข้อมูลแบบ array json : [ {...}, {...} ]
        List<Map<String, String>> dataList = new ArrayList<>();

        Workbook workbook = WorkbookFactory.create(file.getInputStream()); // เปิดไฟล์ excel
        Sheet sheet = workbook.getSheetAt(0); // เรียก sheet ที่หน้าแรก
        DataFormatter formatter = new DataFormatter(); // format ให้ข้อมูลเป็น string
        FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

        // ***--- เตรียมคอลัมน์ ---***
        Row headerRow = sheet.getRow(0); // เรียกแถวบนสุดซึ่งเป็นหัวตารางใน excel
        List<String> headers = new ArrayList<>(); // สร้าง array เก็บ header

        if (headerRow != null) {
            for (Cell cell : headerRow) { // ลูปเรียกทุกเซลล์ใน row ที่ 0
                String headerValue = formatter.formatCellValue(cell) // format ค่าให้เป็น string
                        .trim()             // ลบ space หัว-ท้าย
                        .toLowerCase()      // ทำเป็นตัวพิมพ์เล็ก
                        .replaceAll("\\s+", "_"); // แปลง space เป็น _

                headers.add(headerValue); // เพิ่มค่าลงไปใน array headers
            }
        }

        // ***--- เตรียม value ---***
        List<String> errorSummary = new ArrayList<>();
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            // เรียกตั้งแต่ row ที่ 1 ไปถึง row สุดท้าย
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // สร้าง rowData ซึ่งจะเก็บข้อมูลแบบ json : { key1: value1, key2: value2, .... }
            Map<String, String> rowData = new LinkedHashMap<>();

            // ลูปแต่ละเซลล์ของแต่ละ row โดยเริ่มตั้งแต่เซลล์ที่ 0
            for (int j = 0; j < headers.size(); j++) {
                String columnName = headers.get(j); // เรียกชื่อ header ตามลำดับจากที่เตรียมไว้ใน ***--- เตรียมคอลัมน์ ---***
                String cellValue; // ตัวแปรที่จะเก็บค่า value ใน Cell
                Cell cell = row.getCell(j); // เลือก Cell ตามลำดับใน row

                // เช็คว่าถ้าเป็น Cell ประเภท Date ให้บังคับ Format เอง
                if (cell != null && cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                    SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy"); // บังคับ 4 หลัก
                    cellValue = dateFormat.format(cell.getDateCellValue());
                } else {
                    cellValue = formatter.formatCellValue(cell, evaluator);
                }

                rowData.put(columnName, cellValue); // นำ key และ value ที่ได้มาใส่ใน rowData

            }

            List<String> invalidFields = excelValidator.validate(rowData);

            // ถ้ามีฟิลด์ผิด ให้เอามา Concat
            if (!invalidFields.isEmpty()) {
                String fields = String.join(", ", invalidFields); // เชื่อมด้วย comma
                errorSummary.add("Row " + (i) + " Invalid " + fields);
            }

            // เมื่อลูปเซลล์ในแถวนั้นครบแล้ว เอาข้อมูลมาใส่ใน array dataList ที่เตรียมไว้จาก ***--- เตรียมไฟล์ ---***
            dataList.add(rowData); // [ {row1}, {row2}, {...} ]
        }

        // ถ้ามี error จะโยน error ขึ้นไป
        if (!errorSummary.isEmpty()) {
            throw new RuntimeException(String.join("\n", errorSummary));
        }

        // ปิดไฟล์และ return ค่า
        workbook.close();
        return dataList;
    }

    // เขียนไฟล์
    public ByteArrayInputStream writeExcel(List<Map<String, String>> dataList) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); // เตรียมไฟล์
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                Sheet sheet = workbook.createSheet("excel"); // สร้างชีทชื่อ excel

                if (dataList == null || dataList.isEmpty()) { // หากเป็นค่าว่างก็จะส่งไฟล์เปล่าๆออกไป
                    workbook.write(out);
                    return new ByteArrayInputStream(out.toByteArray());
                }

                Row headerRow = sheet.createRow(0); // สร้าง header ที่ row 0 ซึ่งเป็นหัวตาราง
                List<String> columns = new ArrayList<>(dataList.getFirst().keySet()); // เอา key ใน json ของ array ตัวแรกมาทำหัวตาราง เก็บไว้ในคอลัมน์

                for (int i = 0; i < columns.size(); i++) { // ลูปสร้าง value ของหัวตารางใน row ที่สร้างไว้
                    Cell cell = headerRow.createCell(i); // สร้าง cell
                    cell.setCellValue(columns.get(i)); // set ค่าของ cell ใน row นั้น โดยใช่ค่าจาก array columns ที่เก็บชื่อ key เอาไว้
                }

                int rowIdx = 1;
                for (Map<String, String> rowData : dataList) { // ลูปเอา json แต่ละตัวใน array ที่ถูกส่งเข้ามา : [ {row1},{row2},{row..} ]
                    Row row = sheet.createRow(rowIdx++); // สร้าง row เตรียมไว้

                    for (int i = 0; i < columns.size(); i++) { // ลูปสร้างทีละ cell โดยความยาวเท่ากับจำนวนคอลัมน์
                        String columnName = columns.get(i); // ดึงชื่อคอลัมน์
                        String value = rowData.getOrDefault(columnName, "");  // เรียก value โดยใช้ชื่อคอลัมน์หรือ key ในการหา ถ้าไม่มีจะว่างเปล่า
                        row.createCell(i).setCellValue(value); // สร้างเซลล์และ set ค่า
                    }
                }

                for (int i = 0; i < columns.size(); i++) {
                    sheet.autoSizeColumn(i);
                }

                // จบและคืนค่า
                workbook.write(out);
                return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
