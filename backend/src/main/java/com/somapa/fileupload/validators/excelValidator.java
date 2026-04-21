package com.somapa.fileupload.validators;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Component
public class excelValidator {
    public List<String> validate(Map<String, String> rowData) {
        List<String> invalidFields = new ArrayList<>();

        // เช็ค firstname/lastname
        if (!isNameValid(rowData.get("first_name"))) {
            invalidFields.add("First name");
        }
        if (!isNameValid(rowData.get("last_name"))) {
            invalidFields.add("Last name");
        }

        // เช็ค gender
        if (!isGenderValid(rowData.get("gender"))) {
            invalidFields.add("Gender");
        }

        // เช็ควันเกิด
        if (!isDateOfBirthValid(rowData.get("date_of_birth"))) {
            invalidFields.add("Date of birth");
        }

        // เช็ค Nationality
        if (!isNationalityValid(rowData.get("nationality"))) {
            invalidFields.add("Nationality");
        }

        return invalidFields;
    }

    // ตรวจสอบ string ของ firstname/lastname
    private boolean isNameValid(String value) {
        // ถ้าเป็นค่าว่าง ให้เป็น false
        if (value == null || value.isBlank()) {
            return false;
        }

        String trimValue = value.trim(); //ตัดช่องว่างหัว-ท้าย
        boolean isInvalidLength = trimValue.length() > 20; // เช็คความยาว ไม่เกิน 20 ตัวอักษร
        if (isInvalidLength) { // ถ้าเกินเป็น false
            return false;
        }

        // เช็ค Format ให้มี A-Z, a-z เท่านั้น
        return trimValue.matches("^[a-zA-Z]+$");
    }

    // ตรวจสอบ gender
    private static final Set<String> valid_gender = Set.of("male", "female", "unknown");
    private boolean isGenderValid(String value) {
        if (value == null) return false;

        // แปลงทุกอย่างเป็นตัวพิมพ์เล็กให้หมด แล้วเช็คว่ามีใน Set ไหม
        return valid_gender.contains(value.trim().toLowerCase());
    }

    // เช็ควัน เดือน ปีเกิด
    private boolean isDateOfBirthValid(String value) {
        // ถ้าเป็นค่าว่าง ให้เป็น false
        if (value == null || value.isBlank()) {
            return false;
        }

        try {
            // กำหนด format เป็น เดือน/วัน/ปี
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
            LocalDate dob = LocalDate.parse(value.trim(), formatter);

            // ตรวจสอบว่าวันที่ไม่เกินวันปัจจุบัน
            LocalDate today = LocalDate.now();

            return !dob.isAfter(today);

        } catch (DateTimeParseException e) {
            // ถ้าเข้าตรงนี้ แปลว่า format ผิด หรือวันที่ไม่มีจริงในปฏิทิน
            return false;
        }
    }

    // ตรวจสอบ string ของ Nationality
    private boolean isNationalityValid(String value) {
        // A-Z เท่านั้น และยาว 3 ตัวอักษร
        return value != null && value.trim().matches("^[A-Z]{3}$");
    }
}
