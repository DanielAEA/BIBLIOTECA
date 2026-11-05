import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="CiberBook Predictive Service",
    description="Microservicio de Machine Learning para predicción de demanda de préstamos bibliotecarios",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "modelo_ciberbook.joblib")
COLS_PATH = os.path.join(BASE_DIR, "columnas_modelo.joblib")

model = None
columnas = None

# Mapeo de tolerancia para variaciones tipográficas/acentos
CATEGORIAS_MAP = {
    "academico": "Académico",
    "académico": "Académico",
    "biografia": "Biografía",
    "biografía": "Biografía",
    "ciencia ficcion": "Ciencia Ficción",
    "ciencia ficción": "Ciencia Ficción",
    "fantasia": "Fantasía",
    "fantasía": "Fantasía",
    "historia": "Historia",
    "novela": "Novela"
}

def normalizar_categoria(cat: str) -> str:
    cleaned = cat.strip().lower()
    return CATEGORIAS_MAP.get(cleaned, cat.strip())

@app.on_event("startup")
def startup_load_artifacts():
    global model, columnas
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(COLS_PATH):
            model = joblib.load(MODEL_PATH)
            columnas = joblib.load(COLS_PATH)
            print(f"[ML-CORE] Modelo y columnas ({len(columnas)}) cargados exitosamente.")
        else:
            print(f"[ML-WARN] No se encontraron archivos de modelo en {BASE_DIR}")
    except Exception as e:
        print(f"[ML-ERROR] Error al cargar artefactos de ML: {e}")

class PrediccionInput(BaseModel):
    mes: int = Field(..., ge=1, le=12, description="Mes del año (1 a 12)", example=5)
    categoria: str = Field(..., description="Categoría literaria", example="Novela")
    previo: float = Field(..., ge=0, description="Préstamos del mes anterior", example=44.0)
    prom3: float = Field(..., ge=0, description="Promedio últimos 3 meses", example=38.0)

class PrediccionOutput(BaseModel):
    mes: int
    categoria: str
    prediccion_prestamos: int
    valor_continuo: float
    status: str

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {
        "status": "healthy",
        "service": "ciberbook-predictivo",
        "model_loaded": model is not None,
        "columns_loaded": columnas is not None
    }

@app.post("/predecir", response_model=PrediccionOutput, status_code=status.HTTP_200_OK)
def predecir_demanda(datos: PrediccionInput):
    global model, columnas
    if model is None or columnas is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El modelo predictivo no está disponible o no se ha inicializado."
        )

    try:
        cat_normalizada = normalizar_categoria(datos.categoria)
        
        # Construir vector de características en el orden estricto de columnas_modelo.joblib
        data_dict = {col: 0.0 for col in columnas}
        data_dict["mes"] = float(datos.mes)
        data_dict["previo"] = float(datos.previo)
        data_dict["prom3"] = float(datos.prom3)
        
        col_cat = f"categoria_{cat_normalizada}"
        if col_cat in data_dict:
            data_dict[col_cat] = 1.0

        df_input = pd.DataFrame([data_dict])[columnas]
        pred_raw = model.predict(df_input)[0]
        valor_final = max(0.0, float(pred_raw))

        return PrediccionOutput(
            mes=datos.mes,
            categoria=cat_normalizada,
            prediccion_prestamos=int(round(valor_final)),
            valor_continuo=round(valor_final, 2),
            status="success"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante la inferencia: {str(e)}"
        )
