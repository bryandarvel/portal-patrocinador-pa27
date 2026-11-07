package com.rbs.portal_patrocinador.relatorio;

import static org.junit.jupiter.api.Assertions.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.function.Consumer;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class RelatorioSetorialOfficeTest {
    private static final String MARCA = "Renner (demo)";

    private byte[] excel(Consumer<Sheet> editar) throws Exception {
        try (var input = new ByteArrayInputStream(RelatorioSetorialOffice.modelo(MARCA, false));
             var book = new XSSFWorkbook(input);
             var output = new ByteArrayOutputStream()) {
            editar.accept(book.getSheet("Entregas"));
            book.write(output);
            return output.toByteArray();
        }
    }

    @Test void aceitaDataEQuantidadeComFormatoNumericoDoExcel() throws Exception {
        byte[] arquivo = excel(sheet -> {
            var cell = sheet.getRow(1).getCell(1);
            cell.setCellValue(LocalDateTime.of(2027, 2, 1, 0, 0));
            var dateStyle = sheet.getWorkbook().createCellStyle();
            dateStyle.setDataFormat(sheet.getWorkbook().createDataFormat().getFormat("yyyy-mm"));
            cell.setCellStyle(dateStyle);
            var numberStyle = sheet.getWorkbook().createCellStyle();
            numberStyle.setDataFormat(sheet.getWorkbook().createDataFormat().getFormat("#,##0"));
            sheet.getRow(1).getCell(8).setCellStyle(numberStyle);
        });
        var linha = RelatorioSetorialOffice.ler(arquivo, false, MARCA).getFirst();
        assertEquals(YearMonth.of(2027, 2), linha.mes());
        assertEquals(100000L, linha.impacto());
        assertEquals(10, linha.contratado());
        assertEquals(8, linha.entregue());
    }

    @Test void rejeitaOutraMarcaFormulaMesInvalidoEQuantidadeNegativa() throws Exception {
        assertThrows(ResponseStatusException.class,
                () -> RelatorioSetorialOffice.ler(RelatorioSetorialOffice.modelo(MARCA, false), false, "Outra marca"));
        for (Consumer<Sheet> editar : java.util.List.<Consumer<Sheet>>of(
                sheet -> sheet.getRow(1).getCell(5).setCellFormula("2+2"),
                sheet -> sheet.getRow(1).getCell(5).setCellValue(-1),
                sheet -> sheet.getRow(1).getCell(1).setCellValue("2027-13"))) {
            byte[] arquivo = excel(editar);
            assertThrows(ResponseStatusException.class, () -> RelatorioSetorialOffice.ler(arquivo, false, MARCA));
        }
    }

    @Test void rejeitaMesVeiculoEFormatoDuplicadosNoMesmoArquivo() throws Exception {
        byte[] arquivo = excel(sheet -> {
            var original = sheet.getRow(1);
            var duplicate = sheet.createRow(2);
            for (int i = 0; i < 9; i++) {
                var source = original.getCell(i);
                if (source.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                    duplicate.createCell(i).setCellValue(source.getNumericCellValue());
                } else duplicate.createCell(i).setCellValue(source.getStringCellValue());
            }
        });
        assertThrows(ResponseStatusException.class, () -> RelatorioSetorialOffice.ler(arquivo, false, MARCA));
    }

    @Test void preservaImpactoAusenteEExigeParDeCampos() throws Exception {
        byte[] semImpacto = excel(sheet -> {
            sheet.getRow(1).getCell(7).setBlank();
            sheet.getRow(1).getCell(8).setBlank();
        });
        var linha = RelatorioSetorialOffice.ler(semImpacto, false, MARCA).getFirst();
        assertNull(linha.tipoImpacto());
        assertNull(linha.impacto());
        byte[] incompleto = excel(sheet -> sheet.getRow(1).getCell(8).setBlank());
        assertThrows(ResponseStatusException.class, () -> RelatorioSetorialOffice.ler(incompleto, false, MARCA));
    }

    @Test void importaTabelaWordSemTransformarTextoEmFormula() throws Exception {
        byte[] modelo = RelatorioSetorialOffice.modelo(MARCA, true);
        try (var doc = new org.apache.poi.xwpf.usermodel.XWPFDocument(new ByteArrayInputStream(modelo))) {
            assertEquals(9, doc.getTables().getFirst().getCTTbl().getTblGrid().sizeOfGridColArray());
        }
        var linhas = RelatorioSetorialOffice.ler(modelo, true, MARCA);
        assertEquals(1, linhas.size());
        assertEquals("Rádio", linhas.getFirst().veiculo());
        assertEquals("Inserção de 30 segundos", linhas.getFirst().formato());
    }
}
