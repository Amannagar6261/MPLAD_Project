from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np
import os

app = FastAPI(
    title="MPLADS AI Risk Assessment ML Service",
    description="AI-based anomaly detection using 650 MPLADS projects",
    version="2.0.0"
)

DATASET_PATH = "MPLADS_650_FULL_TECHNICAL_DATASET (2).csv"

# Global ML model
model = None
feature_columns = []


class ProjectFeatures(BaseModel):
    sanctionedAmount: float
    expenditure: float
    expenditureRatio: float
    durationDays: float
    costPerUnit: float = 0.0


def load_dataset():

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    print("Dataset loaded successfully")
    print("Total projects:", len(df))

    return df


def prepare_training_data(df):

    data = pd.DataFrame()

    # Financial features
    data["sanctionedAmount"] = pd.to_numeric(
        df["sanctionedAmount"], errors="coerce"
    )

    data["expenditure"] = pd.to_numeric(
        df["expenditure"], errors="coerce"
    )

    data["expenditureRatio"] = (
        data["expenditure"] /
        data["sanctionedAmount"].replace(0, np.nan)
    )

    # Date features
    start = pd.to_datetime(
        df["startDate"], errors="coerce"
    )

    completion = pd.to_datetime(
        df["completionDate"], errors="coerce"
    )

    data["durationDays"] = (
        completion - start
    ).dt.days

    # Generic cost-per-unit
    data["costPerUnit"] = 0.0

    # Road
    if "roadLengthKm" in df.columns:

        mask = (
            df["roadLengthKm"].notna() &
            (pd.to_numeric(df["roadLengthKm"], errors="coerce") > 0) &
            (df["projectType"].str.lower() == "road")
        )

        data.loc[mask, "costPerUnit"] = (
            data.loc[mask, "sanctionedAmount"] /
            pd.to_numeric(
                df.loc[mask, "roadLengthKm"],
                errors="coerce"
            )
        )

    # Bridge
    if "bridgeLengthMeter" in df.columns:

        mask = (
            df["bridgeLengthMeter"].notna() &
            (pd.to_numeric(
                df["bridgeLengthMeter"],
                errors="coerce"
            ) > 0) &
            (df["projectType"].str.lower() == "bridge")
        )

        data.loc[mask, "costPerUnit"] = (
            data.loc[mask, "sanctionedAmount"] /
            pd.to_numeric(
                df.loc[mask, "bridgeLengthMeter"],
                errors="coerce"
            )
        )

    # Education
    if "classroomCount" in df.columns:

        mask = (
            df["classroomCount"].notna() &
            (pd.to_numeric(
                df["classroomCount"],
                errors="coerce"
            ) > 0) &
            (df["projectType"].str.lower() == "education")
        )

        data.loc[mask, "costPerUnit"] = (
            data.loc[mask, "sanctionedAmount"] /
            pd.to_numeric(
                df.loc[mask, "classroomCount"],
                errors="coerce"
            )
        )

    # Healthcare
    if "bedCount" in df.columns:

        mask = (
            df["bedCount"].notna() &
            (pd.to_numeric(
                df["bedCount"],
                errors="coerce"
            ) > 0) &
            (df["projectType"].str.lower() == "healthcare")
        )

        data.loc[mask, "costPerUnit"] = (
            data.loc[mask, "sanctionedAmount"] /
            pd.to_numeric(
                df.loc[mask, "bedCount"],
                errors="coerce"
            )
        )

    # Water Supply
    if "beneficiaryCount" in df.columns:

        mask = (
            df["beneficiaryCount"].notna() &
            (pd.to_numeric(
                df["beneficiaryCount"],
                errors="coerce"
            ) > 0) &
            (df["projectType"].str.lower() == "water supply")
        )

        data.loc[mask, "costPerUnit"] = (
            data.loc[mask, "sanctionedAmount"] /
            pd.to_numeric(
                df.loc[mask, "beneficiaryCount"],
                errors="coerce"
            )
        )

    # Irrigation
    if "irrigatedArea" in df.columns:

        mask = (
            df["irrigatedArea"].notna() &
            (pd.to_numeric(
                df["irrigatedArea"],
                errors="coerce"
            ) > 0) &
            (df["projectType"].str.lower() == "irrigation")
        )

        data.loc[mask, "costPerUnit"] = (
            data.loc[mask, "sanctionedAmount"] /
            pd.to_numeric(
                df.loc[mask, "irrigatedArea"],
                errors="coerce"
            )
        )

    # Clean missing/infinite values
    data = data.replace(
        [np.inf, -np.inf],
        np.nan
    )

    data = data.fillna(0)

    return data


def train_model():

    global model
    global feature_columns

    df = load_dataset()

    training_data = prepare_training_data(df)

    feature_columns = list(
        training_data.columns
    )

    model = IsolationForest(
        n_estimators=300,
        contamination=0.05,
        random_state=42
    )

    model.fit(training_data)

    print("--------------------------------")
    print("ML MODEL TRAINED")
    print("Projects:", len(training_data))
    print("Features:", feature_columns)
    print("--------------------------------")


@app.on_event("startup")
def startup_event():

    try:
        train_model()
    except Exception as e:
        print("MODEL TRAINING FAILED")
        print(str(e))


@app.get("/")
def home():

    return {
        "message": "MPLADS ML Service is running",
        "status": "success",
        "model": "Isolation Forest",
        "trainingDataset": "650 MPLADS projects"
    }


@app.get("/health")
def health():

    return {
        "service": "MPLADS ML Service",
        "status": "UP",
        "modelLoaded": model is not None,
        "trainingProjects": 650
    }


@app.get("/train")
def retrain():

    try:

        train_model()

        return {
            "status": "success",
            "message": "ML model retrained successfully",
            "projectsUsed": 650,
            "model": "Isolation Forest",
            "features": feature_columns
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/predict")
def predict(features: ProjectFeatures):

    global model

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="ML model is not trained"
        )

    data = np.array([[
        features.sanctionedAmount,
        features.expenditure,
        features.expenditureRatio,
        features.durationDays,
        features.costPerUnit
    ]])

    prediction = model.predict(data)[0]

    anomaly_score = model.decision_function(data)[0]

    is_anomaly = prediction == -1

    # Convert Isolation Forest score
    # into a 0-100 risk score
    ml_risk_score = max(
        0,
        min(
            100,
            int((0.5 - anomaly_score) * 100)
        )
    )

    return {

        "isAnomaly": bool(is_anomaly),

        "anomalyScore": round(
            float(anomaly_score),
            4
        ),

        "mlRiskScore": ml_risk_score,

        "model": "Isolation Forest",

        "trainingDataset": "650 MPLADS projects"
    }