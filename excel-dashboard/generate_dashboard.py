import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, Reference, PieChart
from openpyxl.utils import get_column_letter

def build_advanced_qa_dashboard():
    wb = openpyxl.Workbook()
    
    # -------------------------------------------------------------------------
    # 1. CREACIÓN DE PESTAÑAS
    # -------------------------------------------------------------------------
    ws_dash = wb.active
    ws_dash.title = "Executive Dashboard"
    ws_dash.views.sheetView[0].showGridLines = True
    
    ws_modules = wb.create_sheet(title="Resultados por Modulo")
    ws_modules.views.sheetView[0].showGridLines = True

    ws_bugs = wb.create_sheet(title="Defect Log (Bugs)")
    ws_bugs.views.sheetView[0].showGridLines = True

    # Estilos Generales
    font_family = "Segoe UI"
    header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid") # Dark Slate
    header_font = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    data_font = Font(name=font_family, size=10)
    center_align = Alignment(horizontal="center", vertical="center")
    right_align = Alignment(horizontal="right", vertical="center")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # -------------------------------------------------------------------------
    # 2. DATA EN HOJA: RESULTADOS POR MÓDULO
    # -------------------------------------------------------------------------
    mod_headers = [
        "Módulo / Área Web", "Categoría Pruebas", "Ejecutadas", 
        "OK (Passed)", "Fallos (Failed)", "Bloqueadas", "Pass Rate (%)", "Perf Prom (ms)"
    ]
    
    mod_data = [
        ["Navegación & Header", "Links & Router", 150, 145, 3, 2, 280],
        ["Formulario de Registro", "Form / Inputs", 95, 88, 5, 2, 410],
        ["Checkout & Pasarela", "Form / Payments", 120, 105, 12, 3, 850],
        ["Botones CTA & Modales", "UI / Interacción", 80, 78, 2, 0, 190],
        ["Búsqueda y Filtros", "Performance & API", 110, 98, 10, 2, 630],
        ["Footer & Enlaces Ext", "Links Externos", 45, 45, 0, 0, 220],
        ["Autenticación & Login", "Seguridad / Form", 90, 85, 4, 1, 380],
        ["Carrito de Compras", "E-Commerce / State", 105, 92, 11, 2, 540],
    ]

    ws_modules.append(mod_headers)
    for col in range(1, len(mod_headers) + 1):
        cell = ws_modules.cell(row=1, column=col)
        cell.fill = header_fill; cell.font = header_font; cell.alignment = center_align

    for i, row in enumerate(mod_data, start=2):
        mod, cat, total, ok, fail, block, perf = row
        pass_rate_formula = f'=D{i}/C{i}'
        
        ws_modules.append([mod, cat, total, ok, fail, block, pass_rate_formula, perf])

        # Formatos
        ws_modules.cell(row=i, column=1).font = data_font
        ws_modules.cell(row=i, column=2).font = data_font
        ws_modules.cell(row=i, column=3).alignment = right_align
        ws_modules.cell(row=i, column=4).alignment = right_align
        ws_modules.cell(row=i, column=5).alignment = right_align
        ws_modules.cell(row=i, column=6).alignment = right_align
        
        c_rate = ws_modules.cell(row=i, column=7)
        c_rate.number_format = '0.0%'
        c_rate.alignment = center_align
        
        c_perf = ws_modules.cell(row=i, column=8)
        c_perf.number_format = '#,##0" ms"'
        c_perf.alignment = right_align

        for c in range(1, 9): ws_modules.cell(row=i, column=c).border = thin_border

    # Totales Módulos
    ws_modules["A10"] = "Total / Promedio"
    ws_modules["C10"] = "=SUM(C2:C9)"
    ws_modules["D10"] = "=SUM(D2:D9)"
    ws_modules["E10"] = "=SUM(E2:E9)"
    ws_modules["F10"] = "=SUM(F2:F9)"
    ws_modules["G10"] = "=D10/C10"
    ws_modules["H10"] = "=AVERAGE(H2:H9)"

    for col in ws_modules.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        ws_modules.column_dimensions[get_column_letter(col[0].column)].width = max(max_len + 4, 15)

    # -------------------------------------------------------------------------
    # 3. DATA EN HOJA: DEFECT LOG (BUGS)
    # -------------------------------------------------------------------------
    bug_headers = ["Bug ID", "Módulo Afectado", "Severidad", "Descripción Breve", "Estado", "Responsable"]
    bug_data = [
        ["BUG-001", "Checkout & Pasarela", "Crítica", "Error 500 al procesar pago con Visa", "Abierto", "Dev Team Lead"],
        ["BUG-002", "Checkout & Pasarela", "Alta", "El botón 'Pagar' permite doble clic", "En Progreso", "Frontend QA"],
        ["BUG-003", "Búsqueda y Filtros", "Alta", "Filtro de precio no responde en mobile", "Abierto", "Frontend Lead"],
        ["BUG-004", "Carrito de Compras", "Crítica", "Persistencia de estado se pierde en F5", "Abierto", "Backend QA"],
        ["BUG-005", "Formulario de Registro", "Media", "Validación de email acepta formatos inválidos", "Resuelto", "QA Automation"],
        ["BUG-006", "Autenticación & Login", "Media", "Mensaje de error no accesible para Lector de Pantalla", "Abierto", "UI/UX Dev"],
        ["BUG-007", "Navegación & Header", "Baja", "Desalineación de 2px en el menú desplegable", "Cerrado", "Frontend Dev"],
    ]

    ws_bugs.append(bug_headers)
    for col in range(1, len(bug_headers) + 1):
        cell = ws_bugs.cell(row=1, column=col)
        cell.fill = header_fill; cell.font = header_font; cell.alignment = center_align

    for i, row in enumerate(bug_data, start=2):
        ws_bugs.append(row)
        for c in range(1, 7):
            cell = ws_bugs.cell(row=i, column=c)
            cell.font = data_font
            cell.border = thin_border
            if c in [1, 3, 5]: cell.alignment = center_align

    # Tabla de Resumen de Bugs por Severidad para Gráfico
    ws_bugs["H1"] = "Severidad"
    ws_bugs["I1"] = "Cantidad"
    ws_bugs["H1"].fill = header_fill; ws_bugs["H1"].font = header_font
    ws_bugs["I1"].fill = header_fill; ws_bugs["I1"].font = header_font

    severities = [("Crítica", '=COUNTIF(C2:C8, "Crítica")'),
                  ("Alta", '=COUNTIF(C2:C8, "Alta")'),
                  ("Media", '=COUNTIF(C2:C8, "Media")'),
                  ("Baja", '=COUNTIF(C2:C8, "Baja")')]

    for idx, (sev, form) in enumerate(severities, start=2):
        ws_bugs[f"H{idx}"] = sev
        ws_bugs[f"I{idx}"] = form
        ws_bugs[f"H{idx}"].border = thin_border
        ws_bugs[f"I{idx}"].border = thin_border

    for col in ws_bugs.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        ws_bugs.column_dimensions[get_column_letter(col[0].column)].width = max(max_len + 4, 15)

    # -------------------------------------------------------------------------
    # 4. CONSTRUCCIÓN DEL DASHBOARD EJECUTIVO (KPIs & GRÁFICOS)
    # -------------------------------------------------------------------------
    
    # Titular principal
    ws_dash.merge_cells("B2:K3")
    title_cell = ws_dash["B2"]
    title_cell.value = "WEB TESTING & QUALITY ASSURANCE - DASHBOARD EJECUTIVO"
    title_cell.font = Font(name=font_family, size=15, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid") # Dark Blue
    title_cell.alignment = center_align

    # Tarjetas KPI
    kpi_bg = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    kpi_border = Border(
        left=Side(style='thin', color='CBD5E1'), right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1')
    )

    kpis = [
        ("B5:C5", "B6:C6", "TOTAL PRUEBAS", "='Resultados por Modulo'!C10", "1E3A8A", '#,##0'),
        ("D5:E5", "D6:E6", "PRUEBAS OK", "='Resultados por Modulo'!D10", "16A34A", '#,##0'),
        ("F5:G5", "F6:G6", "FALLOS (FAILED)", "='Resultados por Modulo'!E10", "DC2626", '#,##0'),
        ("H5:I5", "H6:I6", "PASS RATE (%)", "='Resultados por Modulo'!G10", "2563EB", '0.0%'),
        ("J5:K5", "J6:K6", "TOTAL BUGS", "=COUNTA('Defect Log (Bugs)'!A2:A8)", "D97706", '#,##0')
    ]

    for m1, m2, label, formula, color_hex, num_fmt in kpis:
        ws_dash.merge_cells(m1); ws_dash.merge_cells(m2)
        top_cell = ws_dash[m1.split(":")[0]]
        val_cell = ws_dash[m2.split(":")[0]]

        top_cell.value = label
        top_cell.font = Font(name=font_family, size=8, bold=True, color="64748B")
        top_cell.alignment = center_align; top_cell.fill = kpi_bg

        val_cell.value = formula
        val_cell.font = Font(name=font_family, size=16, bold=True, color=color_hex)
        val_cell.alignment = center_align; val_cell.fill = kpi_bg
        val_cell.number_format = num_fmt

    # Aplicar bordes a las tarjetas de KPI
    for col_letter in ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]:
        ws_dash[f"{col_letter}5"].border = kpi_border
        ws_dash[f"{col_letter}6"].border = kpi_border

    # -------------------------------------------------------------------------
    # 5. UBICACIÓN Y CONFIGURACIÓN DE GRÁFICOS (SIN SOLAPAMIENTO)
    # -------------------------------------------------------------------------

    # GRÁFICO 1: Pruebas OK vs Fallos vs Bloqueadas por Módulo (Columna B8)
    chart1 = BarChart()
    chart1.type = "col"
    chart1.style = 10
    chart1.title = "Resultados de Ejecución por Módulo Web"
    chart1.y_axis.title = "Cantidad de Casos"
    
    data1 = Reference(ws_modules, min_col=4, min_row=1, max_col=6, max_row=9)
    cats1 = Reference(ws_modules, min_col=1, min_row=2, max_row=9)
    chart1.add_data(data1, titles_from_data=True)
    chart1.set_categories(cats1)
    chart1.width = 20
    chart1.height = 11

    ws_dash.add_chart(chart1, "B8")

    # GRÁFICO 2: Distribución de Bugs por Severidad (Columna I8 - Al lado del Gráfico 1)
    chart2 = PieChart()
    chart2.title = "Bugs por Severidad"
    
    data2 = Reference(ws_bugs, min_col=9, min_row=1, max_row=5)
    cats2 = Reference(ws_bugs, min_col=8, min_row=2, max_row=5)
    chart2.add_data(data2, titles_from_data=True)
    chart2.set_categories(cats2)
    chart2.width = 11
    chart2.height = 11

    ws_dash.add_chart(chart2, "I8")

    # GRÁFICO 3: Performance (Tiempo de Carga en ms por Módulo) (Ubicado Abajo en B24)
    chart3 = BarChart()
    chart3.type = "bar" # Barras horizontales
    chart3.style = 13
    chart3.title = "Performance: Tiempo Promedio de Respuesta (ms)"
    chart3.x_axis.title = "Milisegundos (ms)"
    
    data3 = Reference(ws_modules, min_col=8, min_row=1, max_row=9)
    cats3 = Reference(ws_modules, min_col=1, min_row=2, max_row=9)
    chart3.add_data(data3, titles_from_data=True)
    chart3.set_categories(cats3)
    chart3.width = 20
    chart3.height = 11

    ws_dash.add_chart(chart3, "B24")

    # Guardar
    output_filename = "Dashboard_QA_Avanzado.xlsx"
    wb.save(output_filename)
    print(f"¡Reporte Avanzado de QA generado con éxito!: {output_filename}")

if __name__ == "__main__":
    build_advanced_qa_dashboard()