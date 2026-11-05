"""
Script de Entrenamiento del Modelo Predictivo de Demanda Bibliotecaria - CiberBook
Algoritmo: Regresión Lineal Multivariable (Scikit-Learn)
Objetivo: Proyectar la demanda mensual de préstamos por categoría literaria
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "modelo_ciberbook.joblib")
COLS_PATH = os.path.join(BASE_DIR, "columnas_modelo.joblib")
DATASET_PATH = os.path.join(BASE_DIR, "dataset_entrenamiento_prestamos.csv")

CATEGORIAS = [
    "Académico",
    "Biografía",
    "Ciencia Ficción",
    "Fantasía",
    "Historia",
    "Novela"
]

def generar_dataset_historico():
    """
    Genera serie temporal sintética calibrada con patrones reales de biblioteca universitaria:
    - Académico: Picos en marzo y agosto (inicio de semestres)
    - Novela / Fantasía: Alta demanda en periodos de vacaciones (junio-julio y diciembre)
    - Historia / Biografía: Demanda estable durante todo el año
    """
    np.random.seed(42)
    registros = []

    # Generamos datos para 4 años (48 meses)
    for anio in range(2021, 2025):
        for cat in CATEGORIAS:
            base_demanda = {
                "Novela": 60,
                "Ciencia Ficción": 45,
                "Fantasía": 40,
                "Historia": 35,
                "Académico": 30,
                "Biografía": 22
            }[cat]

            for mes in range(1, 13):
                factor_estacional = 1.0
                if cat == "Académico":
                    if mes in [3, 8]:
                        factor_estacional = 1.85
                    elif mes in [4, 9, 10]:
                        factor_estacional = 1.35
                    elif mes in [1, 7, 12]:
                        factor_estacional = 0.55
                elif cat in ["Novela", "Ciencia Ficción", "Fantasía"]:
                    if mes in [6, 7, 12]:
                        factor_estacional = 1.40
                    elif mes in [1, 2]:
                        factor_estacional = 1.15
                elif cat in ["Historia", "Biografía"]:
                    if mes in [4, 10]:
                        factor_estacional = 1.15

                ruido = np.random.normal(0, 3.5)
                prestamos = max(5, int(round(base_demanda * factor_estacional + ruido)))

                registros.append({
                    "anio": anio,
                    "mes": mes,
                    "categoria": cat,
                    "prestamos": prestamos
                })

    df = pd.DataFrame(registros)
    df = df.sort_values(by=["categoria", "anio", "mes"]).reset_index(drop=True)

    # Calcular variables de rezago (Lag Features)
    df["previo"] = df.groupby("categoria")["prestamos"].shift(1)
    df["previo_2"] = df.groupby("categoria")["prestamos"].shift(2)
    df["previo_3"] = df.groupby("categoria")["prestamos"].shift(3)
    df["prom3"] = (df["previo"] + df["previo_2"] + df["previo_3"]) / 3.0

    # Descartar los primeros meses sin histórico de rezago completo
    df = df.dropna().reset_index(drop=True)
    return df

def entrenar():
    print("[1/4] Generando dataset histórico calibrado...")
    df = generar_dataset_historico()
    df.to_csv(DATASET_PATH, index=False, encoding="utf-8")
    print(f"      Dataset guardado con {len(df)} registros en: {DATASET_PATH}")

    # One-Hot Encoding de categoría
    print("[2/4] Procesando variables categóricas...")
    df_encoded = pd.get_dummies(df, columns=["categoria"], prefix="categoria", dtype=float)

    # Columnas esperadas por el modelo
    columnas_ordenadas = [
        "mes",
        "previo",
        "prom3",
        "categoria_Académico",
        "categoria_Biografía",
        "categoria_Ciencia Ficción",
        "categoria_Fantasía",
        "categoria_Historia",
        "categoria_Novela"
    ]

    # Verificar que existan todas las columnas
    for c in columnas_ordenadas:
        if c not in df_encoded.columns:
            df_encoded[c] = 0.0

    X = df_encoded[columnas_ordenadas]
    y = df_encoded["prestamos"]

    # División temporal: entrenar hasta 2023, evaluar en 2024
    mask_train = df["anio"] < 2024
    X_train, y_train = X[mask_train], y[mask_train]
    X_test, y_test = X[~mask_train], y[~mask_train]

    print(f"[3/4] Entrenando Regresión Lineal (Train: {len(X_train)}, Test: {len(X_test)})...")
    modelo = LinearRegression(fit_intercept=True)
    modelo.fit(X_train, y_train)

    # Evaluación
    y_pred = modelo.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n================== METRICAS DEL MODELO ==================")
    print(f"  MAE  (Error Absoluto Medio): {mae:.2f} libros")
    print(f"  RMSE (Raíz Error Cuadrático): {rmse:.2f} libros")
    print(f"  R²   (Coeficiente Determinación): {r2:.4f}")
    print("=========================================================\n")

    # Re-entrenar con todo el conjunto para el artefacto productivo final
    modelo.fit(X, y)

    print("[4/4] Exportando artefactos serializados...")
    joblib.dump(modelo, MODEL_PATH)
    joblib.dump(columnas_ordenadas, COLS_PATH)
    print(f"  [OK] Modelo guardado en: {MODEL_PATH}")
    print(f"  [OK] Columnas guardadas en: {COLS_PATH}")

    # Prueba de inferencia rápida
    test_input = pd.DataFrame([{
        "mes": 5,
        "previo": 44.0,
        "prom3": 38.0,
        "categoria_Académico": 0.0,
        "categoria_Biografía": 0.0,
        "categoria_Ciencia Ficción": 0.0,
        "categoria_Fantasía": 0.0,
        "categoria_Historia": 1.0,
        "categoria_Novela": 0.0
    }])[columnas_ordenadas]

    pred = modelo.predict(test_input)[0]
    print(f"\n[Test de Inferencia] Mes 5, Historia (previo=44, prom3=38) -> Predicción: {pred:.2f} (~{round(pred)} libros)\n")

if __name__ == "__main__":
    entrenar()

