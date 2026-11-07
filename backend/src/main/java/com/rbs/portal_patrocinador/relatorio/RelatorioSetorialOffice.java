package com.rbs.portal_patrocinador.relatorio;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class RelatorioSetorialOffice {
    private static final List<String> CABECALHO = List.of("Patrocinador", "Mês", "Veículo",
            "Formato da entrega", "Unidade", "Contratado", "Entregue", "Tipo de impacto", "Impacto");
    private static final int MAX_LINHAS = 500;
    private static final long MAX_QUANTIDADE = 999_999_999_999L;

    static {
        // As nove colunas do modelo não precisam de entradas XML de vários megabytes.
        ZipSecureFile.setMaxEntrySize(8L * 1024 * 1024);
    }

    record Linha(int numero, YearMonth mes, String veiculo, String formato, String unidade,
                 long contratado, long entregue, String tipoImpacto, Long impacto) {
        String chaveFormato() {
            return formato.toLowerCase(Locale.ROOT);
        }
    }

    static List<Linha> ler(byte[] bytes, boolean word, String patrocinador) {
        List<List<String>> dados;
        try (var input = new ByteArrayInputStream(bytes)) {
            dados = word ? lerWord(input) : lerExcel(input);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IOException | RuntimeException e) {
            throw invalido("Não foi possível ler o arquivo. Baixe um modelo e salve novamente no Word ou Excel.");
        }

        if (dados.isEmpty() || !CABECALHO.equals(dados.getFirst())) {
            throw invalido("Cabeçalho diferente do modelo. Mantenha os nomes e a ordem das nove colunas.");
        }
        List<Linha> linhas = new ArrayList<>();
        Set<List<Object>> chaves = new HashSet<>();
        for (int i = 1; i < dados.size(); i++) {
            var row = dados.get(i);
            if (row.stream().allMatch(String::isBlank)) continue;
            int numero = i + 1;
            if (row.size() != CABECALHO.size()) throw linhaInvalida(numero, "use as nove colunas do modelo.");
            if (!row.get(0).equalsIgnoreCase(patrocinador)) {
                throw linhaInvalida(numero, "informe o patrocinador da parceria selecionada.");
            }
            YearMonth mes = mes(row.get(1), numero);
            String veiculo = switch (row.get(2).toLowerCase(Locale.ROOT)) {
                case "tv" -> "TV";
                case "rádio", "radio" -> "Rádio";
                case "digital" -> "Digital";
                case "jornal" -> "Jornal";
                default -> throw linhaInvalida(numero, "o veículo deve ser TV, Rádio, Digital ou Jornal.");
            };
            String formato = campo(row.get(3), 180, numero, "Formato da entrega");
            String unidade = campo(row.get(4), 60, numero, "Unidade");
            long contratado = quantidade(row.get(5), numero, "Contratado");
            long entregue = quantidade(row.get(6), numero, "Entregue");
            String tipo = row.get(7);
            String valor = row.get(8);
            if (tipo.isBlank() != valor.isBlank()) {
                throw linhaInvalida(numero, "preencha Tipo de impacto e Impacto juntos ou deixe os dois vazios.");
            }
            Linha linha = new Linha(numero, mes, veiculo, formato, unidade, contratado, entregue,
                    tipo.isBlank() ? null : campo(tipo, 60, numero, "Tipo de impacto"),
                    valor.isBlank() ? null : quantidade(valor, numero, "Impacto"));
            if (!chaves.add(List.of(mes, veiculo, linha.chaveFormato()))) {
                throw linhaInvalida(numero, "mês, veículo e formato repetidos no arquivo.");
            }
            linhas.add(linha);
        }
        if (linhas.isEmpty()) throw invalido("Preencha pelo menos uma linha abaixo do cabeçalho.");
        return linhas;
    }

    private static List<List<String>> lerExcel(ByteArrayInputStream input) throws IOException {
        try (var workbook = new XSSFWorkbook(input)) {
            var sheet = workbook.getSheet("Entregas");
            if (sheet == null) throw invalido("A planilha precisa ter uma aba chamada Entregas.");
            validarLimite(sheet.getLastRowNum());
            var formatador = new DataFormatter(Locale.ROOT);
            List<List<String>> dados = new ArrayList<>();
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                var row = sheet.getRow(i);
                if (row != null && row.getLastCellNum() > CABECALHO.size()) {
                    throw linhaInvalida(i + 1, "use apenas as nove colunas do modelo.");
                }
                List<String> valores = new ArrayList<>();
                for (int coluna = 0; coluna < CABECALHO.size(); coluna++) {
                    var cell = row == null ? null : row.getCell(coluna);
                    if (cell != null && cell.getCellType() == CellType.FORMULA) {
                        throw linhaInvalida(i + 1, "substitua as fórmulas pelos valores.");
                    }
                    if (i > 0 && cell != null && cell.getCellType() == CellType.NUMERIC) {
                        if (coluna == 1 && DateUtil.isCellDateFormatted(cell)) {
                            valores.add(YearMonth.from(cell.getLocalDateTimeCellValue()).toString());
                            continue;
                        }
                        if (coluna == 5 || coluna == 6 || coluna == 8) {
                            valores.add(BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString());
                            continue;
                        }
                    }
                    valores.add(formatador.formatCellValue(cell).strip());
                }
                dados.add(valores);
            }
            return dados;
        }
    }

    private static List<List<String>> lerWord(ByteArrayInputStream input) throws IOException {
        try (var documento = new XWPFDocument(input)) {
            if (documento.getTables().size() != 1) throw invalido("Use uma única tabela conforme o modelo Word.");
            var tabela = documento.getTables().getFirst();
            validarLimite(tabela.getNumberOfRows() - 1);
            return tabela.getRows().stream().map(row -> row.getTableCells().stream()
                    .map(cell -> cell.getText().strip()).toList()).toList();
        }
    }

    static YearMonth mes(String valor, int linha) {
        try {
            if (!valor.matches("[1-9][0-9]{3}-[0-9]{2}")) throw new DateTimeParseException("Mês", valor, 0);
            return YearMonth.parse(valor);
        } catch (DateTimeParseException e) {
            if (linha == 0) throw invalido("Use o mês no formato AAAA-MM.");
            throw linhaInvalida(linha, "use o mês no formato AAAA-MM.");
        }
    }

    private static long quantidade(String valor, int linha, String campo) {
        try {
            long numero = Long.parseLong(valor);
            if (!valor.matches("[0-9]+") || numero > MAX_QUANTIDADE) throw new NumberFormatException();
            return numero;
        } catch (NumberFormatException e) {
            throw linhaInvalida(linha, campo + " deve ser um inteiro de 0 a 999999999999.");
        }
    }

    private static String campo(String valor, int max, int linha, String nome) {
        if (valor.isBlank() || valor.length() > max || valor.codePoints().anyMatch(Character::isISOControl)) {
            throw linhaInvalida(linha, nome + " deve ter entre 1 e " + max + " caracteres, em uma linha.");
        }
        return valor.replaceAll(" +", " ");
    }

    private static void validarLimite(int linhas) {
        if (linhas > MAX_LINHAS) throw invalido("O modelo aceita até 500 linhas de dados por arquivo.");
    }

    private static ResponseStatusException linhaInvalida(int linha, String mensagem) {
        return invalido("Linha " + linha + " — " + mensagem);
    }

    private static ResponseStatusException invalido(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }

    static byte[] excel(String aba, List<String> cabecalho, List<List<Object>> linhas) throws IOException {
        try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet(aba);
            var font = workbook.createFont();
            font.setBold(true);
            var style = workbook.createCellStyle();
            style.setFont(font);
            var text = workbook.createCellStyle();
            text.setDataFormat(workbook.createDataFormat().getFormat("@"));
            sheet.setDefaultColumnStyle(1, text);
            var heading = sheet.createRow(0);
            for (int i = 0; i < cabecalho.size(); i++) {
                var cell = heading.createCell(i);
                cell.setCellValue(cabecalho.get(i));
                cell.setCellStyle(style);
                sheet.setColumnWidth(i, (i == 0 || i == 3 ? 36 : 20) * 256);
            }
            for (int i = 0; i < linhas.size(); i++) {
                var row = sheet.createRow(i + 1);
                var valores = linhas.get(i);
                for (int j = 0; j < valores.size(); j++) {
                    if (valores.get(j) instanceof Number numero) row.createCell(j).setCellValue(numero.doubleValue());
                    else if (valores.get(j) != null) row.createCell(j).setCellValue(valores.get(j).toString());
                }
            }
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new CellRangeAddress(0, linhas.size(), 0, cabecalho.size() - 1));
            workbook.write(output);
            return output.toByteArray();
        }
    }

    static byte[] modelo(String patrocinador, boolean word) throws IOException {
        List<Object> exemplo = List.of(patrocinador, "2027-02", "Rádio", "Inserção de 30 segundos",
                "inserções", 10, 8, "Acessos", 100000);
        if (!word) return excel("Entregas", CABECALHO, List.of(exemplo));
        try (var doc = new XWPFDocument(); var output = new ByteArrayOutputStream()) {
            doc.createParagraph().createRun().setText("Modelo setorial PA27");
            doc.createParagraph().createRun().setText("Dados fictícios. Substitua os valores da linha de exemplo e mantenha o cabeçalho.");
            var table = doc.createTable(2, CABECALHO.size());
            table.setWidth("100%");
            var grid = table.getCTTbl().addNewTblGrid();
            for (int i = 0; i < CABECALHO.size(); i++) {
                grid.addNewGridCol().setW(BigInteger.valueOf(1600));
                table.getRow(0).getCell(i).setText(CABECALHO.get(i));
                table.getRow(1).getCell(i).setText(exemplo.get(i).toString());
            }
            var section = doc.getDocument().getBody().addNewSectPr();
            var page = section.addNewPgSz();
            page.setW(BigInteger.valueOf(16838));
            page.setH(BigInteger.valueOf(11906));
            var margins = section.addNewPgMar();
            margins.setLeft(BigInteger.valueOf(720));
            margins.setRight(BigInteger.valueOf(720));
            margins.setTop(BigInteger.valueOf(720));
            margins.setBottom(BigInteger.valueOf(720));
            doc.write(output);
            return output.toByteArray();
        }
    }

    private RelatorioSetorialOffice() {}
}
