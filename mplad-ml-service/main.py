from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np
import os


# ============================================================
# MPLADS AI RISK ASSESSMENT ML SERVICE
# Version 3.0.0
# ============================================================

app = FastAPI(
    title="MPLADS AI Risk Assessment ML Service",
    description="AI-based anomaly detection using 650 MPLADS projects",
    version="3.0.0"
)


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_PATH = "MPLADS_650_FULL_TECHNICAL_DATASET (2).csv"

model = None

feature_columns = [
    "sanctionedAmount",
    "expenditure",
    "expenditureRatio",
    "durationDays",
    "costPerUnit"
]


# ============================================================
# REQUEST MODEL
# ============================================================

class ProjectFeatures(BaseModel):

    sanctionedAmount: float
    expenditure: float
    expenditureRatio: float
    durationDays: float
    costPerUnit: float = 0.0


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():

    if not os.path.exists(DATASET_PATH):

        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    print("--------------------------------")
    print("Dataset loaded successfully")
    print("Total projects:", len(df))
    print("--------------------------------")

    return df


# ============================================================
# SAFE NUMERIC CONVERSION
# ============================================================

def numeric_column(df, column):

    if column in df.columns:

        return pd.to_numeric(
            df[column],
            errors="coerce"
        )

    return pd.Series(
        np.nan,
        index=df.index
    )


# ============================================================
# PREPARE TRAINING DATA
# ============================================================

def prepare_training_data(df):

    data = pd.DataFrame(
        index=df.index
    )

    # --------------------------------------------------------
    # FINANCIAL FEATURES
    # --------------------------------------------------------

    data["sanctionedAmount"] = numeric_column(
        df,
        "sanctionedAmount"
    )

    data["expenditure"] = numeric_column(
        df,
        "expenditure"
    )

    # Expenditure ratio
    data["expenditureRatio"] = np.where(
        data["sanctionedAmount"] > 0,
        data["expenditure"] /
        data["sanctionedAmount"],
        0
    )

    # --------------------------------------------------------
    # DATE FEATURES
    # --------------------------------------------------------

    start_date = pd.to_datetime(
        df["startDate"],
        errors="coerce"
    )

    completion_date = pd.to_datetime(
        df["completionDate"],
        errors="coerce"
    )

    data["durationDays"] = (
        completion_date - start_date
    ).dt.days

    # --------------------------------------------------------
    # COST PER UNIT
    # --------------------------------------------------------

    data["costPerUnit"] = 0.0

    project_type = (
        df["projectType"]
        .fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # --------------------------------------------------------
    # ROAD
    # ₹ per kilometer
    # --------------------------------------------------------

    road_length = numeric_column(
        df,
        "roadLengthKm"
    )

    mask = (
        (project_type == "road") &
        road_length.notna() &
        (road_length > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        road_length.loc[mask]
    )

    # --------------------------------------------------------
    # BRIDGE
    # ₹ per meter
    # --------------------------------------------------------

    bridge_length = numeric_column(
        df,
        "bridgeLengthMeter"
    )

    mask = (
        (project_type == "bridge") &
        bridge_length.notna() &
        (bridge_length > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        bridge_length.loc[mask]
    )

    # --------------------------------------------------------
    # EDUCATION
    # ₹ per classroom
    # --------------------------------------------------------

    classroom_count = numeric_column(
        df,
        "classroomCount"
    )

    mask = (
        (project_type == "education") &
        classroom_count.notna() &
        (classroom_count > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        classroom_count.loc[mask]
    )

    # --------------------------------------------------------
    # HEALTHCARE
    # ₹ per bed
    # --------------------------------------------------------

    bed_count = numeric_column(
        df,
        "bedCount"
    )

    mask = (
        (project_type == "healthcare") &
        bed_count.notna() &
        (bed_count > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        bed_count.loc[mask]
    )

    # --------------------------------------------------------
    # WATER SUPPLY
    # ₹ per beneficiary
    # --------------------------------------------------------

    beneficiary_count = numeric_column(
        df,
        "beneficiaryCount"
    )

    mask = (
        (project_type == "water supply") &
        beneficiary_count.notna() &
        (beneficiary_count > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        beneficiary_count.loc[mask]
    )

    # --------------------------------------------------------
    # IRRIGATION
    # ₹ per hectare
    # --------------------------------------------------------

    irrigated_area = numeric_column(
        df,
        "irrigatedArea"
    )

    mask = (
        (project_type == "irrigation") &
        irrigated_area.notna() &
        (irrigated_area > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        irrigated_area.loc[mask]
    )

    # --------------------------------------------------------
    # ELECTRICITY
    # ₹ per kilometer
    # --------------------------------------------------------

    line_length = numeric_column(
        df,
        "lineLengthKm"
    )

    mask = (
        (project_type == "electricity") &
        line_length.notna() &
        (line_length > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        line_length.loc[mask]
    )

    # --------------------------------------------------------
    # SANITATION
    # ₹ per beneficiary where beneficiary data exists
    # --------------------------------------------------------

    mask = (
        (project_type == "sanitation") &
        beneficiary_count.notna() &
        (beneficiary_count > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        beneficiary_count.loc[mask]
    )

    # --------------------------------------------------------
    # COMMUNITY
    # ₹ per beneficiary where beneficiary data exists
    # --------------------------------------------------------

    mask = (
        (project_type == "community") &
        beneficiary_count.notna() &
        (beneficiary_count > 0)
    )

    data.loc[mask, "costPerUnit"] = (
        data.loc[mask, "sanctionedAmount"] /
        beneficiary_count.loc[mask]
    )

    # --------------------------------------------------------
    # CLEAN DATA
    # --------------------------------------------------------

    data = data.replace(
        [np.inf, -np.inf],
        np.nan
    )

    data = data.fillna(0)

    # Ensure no negative duration
    data["durationDays"] = data[
        "durationDays"
    ].clip(lower=0)

    # Ensure no negative financial values
    data["sanctionedAmount"] = data[
        "sanctionedAmount"
    ].clip(lower=0)

    data["expenditure"] = data[
        "expenditure"
    ].clip(lower=0)

    data["costPerUnit"] = data[
        "costPerUnit"
    ].clip(lower=0)

    return data


# ============================================================
# TRAIN MODEL
# ============================================================

def train_model():

    global model

    df = load_dataset()

    training_data = prepare_training_data(
        df
    )

    # --------------------------------------------------------
    # Isolation Forest
    # --------------------------------------------------------

    model = IsolationForest(
        n_estimators=300,
        contamination=0.05,
        random_state=42
    )

    model.fit(
        training_data[feature_columns]
    )

    print("--------------------------------")
    print("ML MODEL TRAINED SUCCESSFULLY")
    print("Projects used:", len(training_data))
    print("Features:", feature_columns)
    print("--------------------------------")

    # --------------------------------------------------------
    # Feature statistics
    # --------------------------------------------------------

    print("Feature statistics:")

    for feature in feature_columns:

        print(
            feature,
            "min=",
            round(
                float(
                    training_data[feature].min()
                ),
                2
            ),
            "max=",
            round(
                float(
                    training_data[feature].max()
                ),
                2
            )
        )


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup_event():

    try:

        train_model()

    except Exception as e:

        print("--------------------------------")
        print("MODEL TRAINING FAILED")
        print(str(e))
        print("--------------------------------")


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {

        "message":
            "MPLADS ML Service is running",

        "status":
            "success",

        "model":
            "Isolation Forest",

        "version":
            "3.0.0",

        "trainingDataset":
            "650 MPLADS projects",

        "features":
            feature_columns
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {

        "service":
            "MPLADS ML Service",

        "status":
            "UP",

        "modelLoaded":
            model is not None,

        "trainingProjects":
            650,

        "model":
            "Isolation Forest",

        "features":
            feature_columns
    }


# ============================================================
# RETRAIN
# ============================================================

@app.get("/train")
def retrain():

    try:

        train_model()

        return {

            "status":
                "success",

            "message":
                "ML model retrained successfully",

            "projectsUsed":
                650,

            "model":
                "Isolation Forest",

            "features":
                feature_columns
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
def predict(
    features: ProjectFeatures
):

    global model

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="ML model is not trained"
        )

    # --------------------------------------------------------
    # Prepare project data
    # --------------------------------------------------------

    data = np.array([[
        features.sanctionedAmount,
        features.expenditure,
        features.expenditureRatio,
        features.durationDays,
        features.costPerUnit
    ]], dtype=float)

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = model.predict(
        data
    )[0]

    # --------------------------------------------------------
    # Isolation Forest anomaly score
    # --------------------------------------------------------

    anomaly_score = model.decision_function(
        data
    )[0]

    is_anomaly = (
        prediction == -1
    )

    # --------------------------------------------------------
    # Convert anomaly score to 0-100
    # --------------------------------------------------------

    ml_risk_score = max(
        0,
        min(
            100,
            int(
                (0.5 - anomaly_score) * 100
            )
        )
    )

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if ml_risk_score <= 30:

        risk_level = "LOW"

    elif ml_risk_score <= 60:

        risk_level = "MEDIUM"

    elif ml_risk_score <= 80:

        risk_level = "HIGH"

    else:

        risk_level = "CRITICAL"

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "isAnomaly":
            bool(is_anomaly),

        "anomalyScore":
            round(
                float(anomaly_score),
                4
            ),

        "mlRiskScore":
            ml_risk_score,

        "riskLevel":
            risk_level,

        "model":
            "Isolation Forest",

        "trainingDataset":
            "650 MPLADS projects",

        "featuresUsed":
            feature_columns
    }