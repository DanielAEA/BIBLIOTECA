import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

books = [
    {
        "code": "EXPO-001",
        "title": "Lo que los jóvenes preguntan: Respuestas prácticas (Vol. 1)",
        "author": "Watch Tower Bible and Tract Society",
        "qr": "etiquetas_qr/QR_EXPO-001_JovenesPreguntan.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/jovenes-preguntan.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000001-0000-4000-a000-000000000001"
    },
    {
        "code": "EXPO-002",
        "title": "Pepita Jiménez",
        "author": "Juan Valera",
        "qr": "etiquetas_qr/QR_EXPO-002_PepitaJimenez.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/pepita-jimenez.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000002-0000-4000-a000-000000000002"
    },
    {
        "code": "EXPO-003",
        "title": "Hamlet, El Príncipe de Dinamarca",
        "author": "William Shakespeare",
        "qr": "etiquetas_qr/QR_EXPO-003_Hamlet.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/hamlet.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000003-0000-4000-a000-000000000003"
    },
    {
        "code": "EXPO-004",
        "title": "Liderazgo 101: Compresión del Liderazgo",
        "author": "Edmund Sackey-Brown",
        "qr": "etiquetas_qr/QR_EXPO-004_Liderazgo101.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/liderazgo-101.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000004-0000-4000-a000-000000000004"
    },
    {
        "code": "EXPO-005",
        "title": "El extraño caso del Dr. Jekyll y Mr. Hyde",
        "author": "Robert Louis Stevenson",
        "qr": "etiquetas_qr/QR_EXPO-005_DrJekyllMrHyde.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/dr-jekyll-mr-hyde.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000005-0000-4000-a000-000000000005"
    },
    {
        "code": "EXPO-006",
        "title": "El Verdadero Mensaje de Jesucristo",
        "author": "Dr. Bilal Philips",
        "qr": "etiquetas_qr/QR_EXPO-006_MensajeJesucristo.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/mensaje-jesucristo.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000006-0000-4000-a000-000000000006"
    },
    {
        "code": "EXPO-007",
        "title": "El jardín italiano",
        "author": "Alyson Richman",
        "qr": "etiquetas_qr/QR_EXPO-007_JardinItaliano.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/jardin-italiano.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000007-0000-4000-a000-000000000007"
    },
    {
        "code": "EXPO-008",
        "title": "Gramática Abreviada: Lengua Portuguesa",
        "author": "Gracineia Araújo",
        "qr": "etiquetas_qr/QR_EXPO-008_GramaticaPortuguesa.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/gramatica-portuguesa.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000008-0000-4000-a000-000000000008"
    },
    {
        "code": "EXPO-009",
        "title": "The Power of Now: A Guide to Spiritual Enlightenment",
        "author": "Eckhart Tolle",
        "qr": "etiquetas_qr/QR_EXPO-009_PowerOfNow.png",
        "cover": "sistema-prestamos-frontend/frontend/src/assets/libros-expofair/power-of-now.jpg",
        "url": "https://ciberbook-frontend-production.up.railway.app/solicitar-ejemplar/e1000009-0000-4000-a000-000000000009"
    }
]

doc = Document()

# Set page margins to 1.2 cm for maximum printable area
for section in doc.sections:
    section.top_margin = Cm(1.2)
    section.bottom_margin = Cm(1.2)
    section.left_margin = Cm(1.2)
    section.right_margin = Cm(1.2)

# Helper function to set cell borders
def set_cell_borders(cell, top="dashed", bottom="dashed", left="dashed", right="dashed", color="94A3B8", sz="12"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="{top}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:left w:val="{left}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:bottom w:val="{bottom}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:right w:val="{right}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_cell_shading(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>\n'
        f'  <w:top w:w="{top}" w:type="dxa"/>\n'
        f'  <w:left w:w="{left}" w:type="dxa"/>\n'
        f'  <w:bottom w:w="{bottom}" w:type="dxa"/>\n'
        f'  <w:right w:w="{right}" w:type="dxa"/>\n'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

# Title Banner
p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_title = p_title.add_run("📖 CIBERBOOK — ETIQUETAS QR PARA LIBROS FÍSICOS")
run_title.font.name = "Segoe UI"
run_title.font.size = Pt(16)
run_title.font.bold = True
run_title.font.color.rgb = RGBColor(30, 58, 138) # Navy Blue
p_title.paragraph_format.space_after = Pt(2)

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_sub = p_sub.add_run("Stand de Expoferia • Mesa 1 | Recorta por la línea punteada y pega en tus libros")
run_sub.font.name = "Segoe UI"
run_sub.font.size = Pt(10)
run_sub.font.color.rgb = RGBColor(100, 116, 139) # Slate Grey
p_sub.paragraph_format.space_after = Pt(12)

# Grid of labels: 2 columns
# We create an outer table with 2 columns, rows = ceil(len(books) / 2)
num_rows = (len(books) + 1) // 2
grid_table = doc.add_table(rows=num_rows, cols=2)
grid_table.alignment = WD_TABLE_ALIGNMENT.CENTER

col_width = Cm(9.1)

for r_idx in range(num_rows):
    row = grid_table.rows[r_idx]
    for c_idx in range(2):
        b_idx = r_idx * 2 + c_idx
        cell = row.cells[c_idx]
        cell.width = col_width
        
        if b_idx < len(books):
            b = books[b_idx]
            set_cell_borders(cell, top="dashed", bottom="dashed", left="dashed", right="dashed", color="3B82F6", sz="16")
            set_cell_shading(cell, "FFFFFF")
            set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
            
            # Inside this cell, create a mini layout table
            inner_p = cell.paragraphs[0]
            inner_p.paragraph_format.space_before = Pt(0)
            inner_p.paragraph_format.space_after = Pt(4)
            
            # Header line: CiberBook + Badge
            run_card_brand = inner_p.add_run("CIBERBOOK  ")
            run_card_brand.font.name = "Segoe UI"
            run_card_brand.font.size = Pt(9.5)
            run_card_brand.font.bold = True
            run_card_brand.font.color.rgb = RGBColor(30, 58, 138)
            
            run_card_loc = inner_p.add_run("• STAND EXPOFERIA")
            run_card_loc.font.name = "Segoe UI"
            run_card_loc.font.size = Pt(8.5)
            run_card_loc.font.bold = True
            run_card_loc.font.color.rgb = RGBColor(5, 150, 105) # Green
            
            # Inner 2-column layout: Left = QR, Right = Info & Cover
            inner_table = cell.add_table(rows=1, cols=2)
            inner_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            
            cell_qr = inner_table.rows[0].cells[0]
            cell_info = inner_table.rows[0].cells[1]
            cell_qr.width = Cm(3.6)
            cell_info.width = Cm(5.1)
            set_cell_borders(cell_qr, top="none", bottom="none", left="none", right="none")
            set_cell_borders(cell_info, top="none", bottom="none", left="none", right="none")
            set_cell_margins(cell_qr, top=40, bottom=40, left=40, right=40)
            set_cell_margins(cell_info, top=40, bottom=40, left=60, right=40)
            
            # QR Cell
            p_qr = cell_qr.paragraphs[0]
            p_qr.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_qr.paragraph_format.space_after = Pt(2)
            if os.path.exists(b["qr"]):
                p_qr.add_run().add_picture(b["qr"], width=Cm(3.3), height=Cm(3.3))
            
            p_scan = cell_qr.add_paragraph()
            p_scan.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_scan.paragraph_format.space_after = Pt(0)
            run_scan = p_scan.add_run("📱 Escanea para prestar")
            run_scan.font.name = "Segoe UI"
            run_scan.font.size = Pt(7.5)
            run_scan.font.bold = True
            run_scan.font.color.rgb = RGBColor(71, 85, 105)
            
            # Info Cell: Cover thumb + Title + Author + Code
            p_info = cell_info.paragraphs[0]
            p_info.paragraph_format.space_before = Pt(0)
            p_info.paragraph_format.space_after = Pt(2)
            
            # Title
            run_btitle = p_info.add_run(b["title"] + "\n")
            run_btitle.font.name = "Segoe UI"
            run_btitle.font.size = Pt(9.5)
            run_btitle.font.bold = True
            run_btitle.font.color.rgb = RGBColor(15, 23, 42)
            
            # Author
            run_bauth = p_info.add_run(b["author"] + "\n")
            run_bauth.font.name = "Segoe UI"
            run_bauth.font.size = Pt(8.5)
            run_bauth.font.italic = True
            run_bauth.font.color.rgb = RGBColor(71, 85, 105)
            
            # Code Badge
            run_bcode = p_info.add_run(f"CÓDIGO: {b['code']}\n")
            run_bcode.font.name = "Consolas"
            run_bcode.font.size = Pt(9)
            run_bcode.font.bold = True
            run_bcode.font.color.rgb = RGBColor(37, 99, 235) # Blue
            
            # Mini Cover Thumbnail
            if os.path.exists(b["cover"]):
                p_cover = cell_info.add_paragraph()
                p_cover.paragraph_format.space_before = Pt(2)
                p_cover.paragraph_format.space_after = Pt(0)
                p_cover.add_run().add_picture(b["cover"], height=Cm(1.8))
            
            # Card footer inside cell
            p_footer = cell.add_paragraph()
            p_footer.paragraph_format.space_before = Pt(3)
            p_footer.paragraph_format.space_after = Pt(0)
            run_cut = p_footer.add_run("✂️ Recortar por la línea punteada")
            run_cut.font.name = "Segoe UI"
            run_cut.font.size = Pt(7)
            run_cut.font.color.rgb = RGBColor(148, 163, 184)
            
        else:
            # Empty cell (if odd number of books)
            set_cell_borders(cell, top="none", bottom="none", left="none", right="none")
            cell.paragraphs[0].text = ""

desktop_path = r"C:\Users\danie\Desktop\Etiquetas_QR_Libros_Fisicos.docx"
doc.save(desktop_path)
print(f"Document successfully created at: {desktop_path}")

