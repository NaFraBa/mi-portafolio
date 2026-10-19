"""Genera el dashboard ejecutivo de QA en Excel a partir de los reportes
JSON de Playwright y Cypress (mochawesome).

Uso (desde la raíz del proyecto):
    py excel-dashboard/generate_dashboard.py
    py excel-dashboard/generate_dashboard.py Mi_Reporte
    py excel-dashboard/generate_dashboard.py Mi_Reporte.xlsx
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import BarChart, PieChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

# Rutas absolutas: el script funciona igual se ejecute desde donde se ejecute
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
PLAYWRIGHT_JSON = ROOT_DIR / "playwright-report" / "results.json"
CYPRESS_REPORT_DIR = ROOT_DIR / "cypress" / "reports"

# Módulos del portfolio: nombre -> categoría
MODULOS = {
    "Hero & Servidor": "Disponibilidad HTTP / Hero",
    "Navegacion & Menu": "Router / Enlaces Ancla",
    "Habilidades": "DOM Dinamico / Skills",
    "Proyectos": "Tarjetas & Tabs UI",
    "Contacto & Redes": "Links Externos & Descarga CV",
}
MODULO_OTROS = "Otros / Sin clasificar"

# Reglas de clasificación por palabras clave (se evalúan en este orden).
REGLAS = [
    ("Contacto & Redes", r"CONTACTO|REDES|CORREO|EXTERNO|\bCV\b"),
    ("Navegacion & Menu", r"NAVEGA|MENU|SCROLL|\bURL\b|ENLACE"),
    ("Proyectos", r"PROYECTO"),
    ("Habilidades", r"SKILL|HABILIDAD"),
    ("Hero & Servidor", r"HERO|SERVIDOR|HTTP|ENCABEZADO|TITULO|CARGA"),
]


def _normalizar(texto):
    """Mayúsculas y sin tildes para comparar palabras clave."""
    texto = unicodedata.normalize("NFKD", str(texto))
    return "".join(c for c in texto if not unicodedata.combining(c)).upper()


def clasificar(*titulos):
    """Devuelve el módulo según el primer título que encaje con una regla."""
    for titulo in titulos:
        t = _normalizar(titulo)
        for modulo, patron in REGLAS:
            if re.search(patron, t):
                return modulo
    return MODULO_OTROS


def _nuevo_modulo(categoria):
    return {"cat": categoria, "ok": 0, "fail": 0, "skip": 0, "duraciones": []}


def _registrar(modulos, modulo, estado, duracion):
    """estado: 'ok' | 'fail' | 'skip'."""
    if modulo not in modulos:
        modulos[modulo] = _nuevo_modulo("Sin categoria")
    modulos[modulo][estado] += 1
    if estado != "skip" and duracion:
        modulos[modulo]["duraciones"].append(duracion)


def _leer_playwright(modulos):
    """Lee el reporter JSON de Playwright (suites anidadas)."""
    if not PLAYWRIGHT_JSON.exists():
        print(f"Aviso: no existe {PLAYWRIGHT_JSON.relative_to(ROOT_DIR)}")
        return 0

    with PLAYWRIGHT_JSON.open(encoding="utf-8") as f:
        data = json.load(f)

    contador = 0

    def recorrer(suite, padres):
        nonlocal contador
        titulos_padre = padres + [suite.get("title", "")]
        for spec in suite.get("specs", []):
            modulo = clasificar(spec.get("title", ""), *reversed(titulos_padre))
            for test in spec.get("tests", []):
                status = test.get("status")
                if status == "skipped":
                    estado = "skip"
                elif status in ("expected", "flaky"):
                    estado = "ok"
                else:
                    estado = "fail"
                resultados = test.get("results") or [{}]
                duracion = resultados[-1].get("duration", 0)
                _registrar(modulos, modulo, estado, duracion)
                contador += 1
        for sub in suite.get("suites", []):
            recorrer(sub, titulos_padre)

    for suite in data.get("suites", []):
        recorrer(suite, [])
    return contador


def _leer_cypress(modulos):
    """Lee los JSON de mochawesome generados por cypress-mochawesome-reporter."""
    jsons_dir = CYPRESS_REPORT_DIR / ".jsons"
    ficheros = sorted(jsons_dir.glob("*.json")) if jsons_dir.exists() else []
    if not ficheros and (CYPRESS_REPORT_DIR / "index.json").exists():
        ficheros = [CYPRESS_REPORT_DIR / "index.json"]
    if not ficheros:
        print("Aviso: no se encontraron reportes JSON de Cypress")
        return 0

    contador = 0

    def recorrer(suite):
        nonlocal contador
        for test in suite.get("tests", []):
            if test.get("pass"):
                estado = "ok"
            elif test.get("fail"):
                estado = "fail"
            else:
                estado = "skip"
            modulo = clasificar(test.get("title", ""), test.get("fullTitle", ""))
            _registrar(modulos, modulo, estado, test.get("duration", 0))
            contador += 1
        for sub in suite.get("suites", []):
            recorrer(sub)

    for fichero in ficheros:
        try:
            with fichero.open(encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, json.JSONDecodeError) as e:
            print(f"Aviso Cypress ({fichero.name}): {e}")
            continue
        for resultado in data.get("results", []):
            recorrer(resultado)
    return contador


def extraer_datos_reales():
    """Devuelve una fila por módulo:
    [modulo, categoria, ejecutadas, ok, fallos, bloqueadas, perf_media_ms]
    """
    modulos = {nombre: _nuevo_modulo(cat) for nombre, cat in MODULOS.items()}

    try:
        n_pw = _leer_playwright(modulos)
    except (OSError, json.JSONDecodeError) as e:
        print(f"Aviso Playwright: {e}")
        n_pw = 0
    n_cy = _leer_cypress(modulos)
    print(f"Tests leidos -> Playwright: {n_pw} | Cypress: {n_cy}")

    filas = []
    for nombre, val in modulos.items():
        total = val["ok"] + val["fail"] + val["skip"]
        if nombre == MODULO_OTROS and total == 0:
            continue
        durs = val["duraciones"]
        perf = round(sum(durs) / len(durs)) if durs else 0
        filas.append(
            [nombre, val["cat"], total, val["ok"], val["fail"], val["skip"], perf]
        )
    return filas


def build_advanced_qa_dashboard(output="excel-dashboard/QA_Executive_Dashboard.xlsx"):
    wb = Workbook()

    # Pestañas
    ws_dash = wb.active
    ws_dash.title = "Executive Dashboard"
    ws_modules = wb.create_sheet(title="Resultados por Modulo")
    ws_bugs = wb.create_sheet(title="Defect Log (Bugs)")

    # Estilos
    font_family = "Segoe UI"
    header_fill = PatternFill(
        start_color="0F172A", end_color="0F172A", fill_type="solid"
    )
    header_font = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    data_font = Font(name=font_family, size=10)
    bold_font = Font(name=font_family, size=10, bold=True)
    center_align = Alignment(horizontal="center", vertical="center")
    right_align = Alignment(horizontal="right", vertical="center")
    thin_side = Side(style="thin", color="E2E8F0")
    thin_border = Border(
        left=thin_side, right=thin_side, top=thin_side, bottom=thin_side
    )
    fmt_ms = '#,##0" ms"'

    def pintar_cabecera(ws, n_cols):
        for col in range(1, n_cols + 1):
            c = ws.cell(row=1, column=col)
            c.fill = header_fill
            c.font = header_font
            c.alignment = center_align
            c.border = thin_border

    def autoajustar_columnas(ws, minimo=12):
        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            letra = get_column_letter(col[0].column)
            ws.column_dimensions[letra].width = max(max_len + 4, minimo)

    # ------------------------------------------------------------------
    # 1. Hoja: Resultados por Módulo
    # ------------------------------------------------------------------
    mod_headers = [
        "Modulo / Area Web",
        "Categoria Pruebas",
        "Ejecutadas",
        "OK (Passed)",
        "Fallos (Failed)",
        "Bloqueadas",
        "Pass Rate (%)",
        "Perf Prom (ms)",
    ]
    ws_modules.append(mod_headers)
    pintar_cabecera(ws_modules, len(mod_headers))

    datos = extraer_datos_reales()

    for i, (mod, cat, total, ok, fail, block, perf) in enumerate(datos, start=2):
        ws_modules.append(
            [mod, cat, total, ok, fail, block, f"=IF(C{i}=0,0,D{i}/C{i})", perf]
        )
        for col in range(1, 9):
            c = ws_modules.cell(row=i, column=col)
            c.font = data_font
            c.border = thin_border
            if 3 <= col <= 6 or col == 8:
                c.alignment = right_align
        ws_modules.cell(row=i, column=7).number_format = "0.0%"
        ws_modules.cell(row=i, column=7).alignment = center_align
        ws_modules.cell(row=i, column=8).number_format = fmt_ms

    ult = len(datos) + 1
    tot_r = ult + 1
    ws_modules[f"A{tot_r}"] = "Total / Promedio"
    for letra in "CDEF":
        ws_modules[f"{letra}{tot_r}"] = f"=SUM({letra}2:{letra}{ult})"
    ws_modules[f"G{tot_r}"] = f"=IF(C{tot_r}=0,0,D{tot_r}/C{tot_r})"
    ws_modules[f"G{tot_r}"].number_format = "0.0%"
    ws_modules[f"H{tot_r}"] = f'=IFERROR(AVERAGEIF(H2:H{ult},">0"),0)'
    ws_modules[f"H{tot_r}"].number_format = fmt_ms
    for col in range(1, 9):
        c = ws_modules.cell(row=tot_r, column=col)
        c.font = bold_font
        c.border = thin_border
        c.alignment = center_align if col == 7 else right_align
    ws_modules[f"A{tot_r}"].alignment = Alignment(vertical="center")

    autoajustar_columnas(ws_modules, minimo=15)
    ws_modules.freeze_panes = "A2"

    # ------------------------------------------------------------------
    # 2. Hoja: Defect Log
    # ------------------------------------------------------------------
    bug_headers = [
        "Bug ID",
        "Modulo Afectado",
        "Severidad",
        "Descripcion Breve",
        "Estado",
        "Responsable",
    ]
    bug_data = [
        [
            "BUG-001",
            "Proyectos",
            "Media",
            "Pestana secundaria requiere seleccion activa",
            "Resuelto",
            "QA Automation",
        ],
        [
            "BUG-002",
            "Habilidades",
            "Baja",
            "Animacion CSS requiere scroll",
            "Resuelto",
            "Frontend QA",
        ],
    ]
    ws_bugs.append(bug_headers)
    pintar_cabecera(ws_bugs, len(bug_headers))

    for i, row in enumerate(bug_data, start=2):
        ws_bugs.append(row)
        for col in range(1, len(bug_headers) + 1):
            c = ws_bugs.cell(row=i, column=col)
            c.font = data_font
            c.border = thin_border
            if col in (1, 3, 5):
                c.alignment = center_align

    autoajustar_columnas(ws_bugs)
    ws_bugs.freeze_panes = "A2"

    # ------------------------------------------------------------------
    # 3. Hoja: Executive Dashboard
    # ------------------------------------------------------------------
    ws_dash.column_dimensions["A"].width = 3
    for col in range(2, 12):
        ws_dash.column_dimensions[get_column_letter(col)].width = 14

    ws_dash.merge_cells("B2:K3")
    t = ws_dash["B2"]
    t.value = "PORTFOLIO QA AUTOMATION - EXECUTIVE DASHBOARD"
    t.font = Font(name=font_family, size=14, bold=True, color="FFFFFF")
    t.fill = PatternFill(
        start_color="1E3A8A", end_color="1E3A8A", fill_type="solid"
    )
    t.alignment = center_align

    hoja = "'Resultados por Modulo'"
    kpis = [
        ("B", "C", "TOTAL PRUEBAS", f"={hoja}!C{tot_r}", "1E3A8A", "#,##0"),
        ("D", "E", "PRUEBAS OK", f"={hoja}!D{tot_r}", "16A34A", "#,##0"),
        ("F", "G", "FALLOS (FAILED)", f"={hoja}!E{tot_r}", "DC2626", "#,##0"),
        ("H", "I", "PASS RATE (%)", f"={hoja}!G{tot_r}", "2563EB", "0.0%"),
        ("J", "K", "PERF PROMEDIO", f"={hoja}!H{tot_r}", "D97706", fmt_ms),
    ]

    kpi_bg = PatternFill(
        start_color="F8FAFC", end_color="F8FAFC", fill_type="solid"
    )
    kpi_side = Side(style="thin", color="CBD5E1")
    kpi_border = Border(
        left=kpi_side, right=kpi_side, top=kpi_side, bottom=kpi_side
    )
    ws_dash.row_dimensions[6].height = 30

    for c1, c2, label, formula, color_hex, num_fmt in kpis:
        r_top, r_val = f"{c1}5:{c2}5", f"{c1}6:{c2}6"
        ws_dash.merge_cells(r_top)
        ws_dash.merge_cells(r_val)

        top_c = ws_dash[f"{c1}5"]
        top_c.value = label
        top_c.font = Font(name=font_family, size=9, bold=True, color="64748B")

        val_c = ws_dash[f"{c1}6"]
        val_c.value = formula
        val_c.font = Font(name=font_family, size=16, bold=True, color=color_hex)
        val_c.number_format = num_fmt

        for rango in (r_top, r_val):
            for row in ws_dash[rango]:
                for c in row:
                    c.fill = kpi_bg
                    c.border = kpi_border
                    c.alignment = center_align

    # ------------------------------------------------------------------
    # 4. Gráficos
    # ------------------------------------------------------------------
    bar = BarChart()
    bar.type = "col"
    bar.title = "Resultados Smoke Tests por Modulo"
    bar.y_axis.title = "Tests"
    bar.width = 15
    bar.height = 9
    bar.add_data(
        Reference(ws_modules, min_col=4, min_row=1, max_col=5, max_row=ult),
        titles_from_data=True,
    )
    bar.set_categories(Reference(ws_modules, min_col=1, min_row=2, max_row=ult))
    bar.x_axis.delete = False
    bar.y_axis.delete = False
    ws_dash.add_chart(bar, "B9")

    pie = PieChart()
    pie.title = "Pass Rate Global"
    pie.width = 10
    pie.height = 9
    pie.add_data(
        Reference(ws_modules, min_col=4, min_row=tot_r, max_col=5, max_row=tot_r),
        from_rows=True,
        titles_from_data=False,
    )
    pie.set_categories(
        Reference(ws_modules, min_col=4, min_row=1, max_col=5, max_row=1)
    )
    pie.dataLabels = DataLabelList()
    pie.dataLabels.showPercent = True
    ws_dash.add_chart(pie, "H9")

    # ------------------------------------------------------------------
    # Guardado
    # ------------------------------------------------------------------
    output = Path(output)

    # Si no tiene extensión .xlsx, se la agrega automáticamente
    if output.suffix.lower() != ".xlsx":
        output = output.with_suffix(".xlsx")

    # Si solo pasas el nombre (sin carpeta), lo coloca en excel-dashboard/
    if len(output.parts) == 1:
        output = Path("excel-dashboard") / output

    output.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output)
    print(f"Excel generado exitosamente en: {output}")
    return output


if __name__ == "__main__":
    # Lee el argumento de la terminal si existe; de lo contrario usa el valor por defecto
    custom_output = sys.argv[1] if len(sys.argv) > 1 else "QA_Executive_Dashboard.xlsx"
    build_advanced_qa_dashboard(custom_output)