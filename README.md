    # HR Analytics Platform - Employee Attrition Prediction

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![CatBoost](https://img.shields.io/badge/CatBoost-ML-orange.svg)](https://catboost.ai/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Interface-red.svg)](https://streamlit.io/)
[![SHAP](https://img.shields.io/badge/SHAP-XAI-green.svg)](https://github.com/slundberg/shap)

> A proactive HR analytics platform that transforms employee departure risks into strategic retention opportunities through machine learning and explainable AI.

##  Team 16

- **Nathan Georges**
- **Victor Navas Fernandez**
- **LP**
- **Arjuna Santhosh**
- **Thomas Wartelle**

##  Project Overview

This HR analytics platform is designed to anticipate employee attrition before it happens. By leveraging advanced machine learning techniques, we convert departure risks into actionable retention strategies, shifting HR management from a reactive to a proactive stance.

### Key Capabilities

- **Predictive Analytics**: Calculates employee churn probability using state-of-the-art CatBoost classification
- **Explainable AI**: Provides transparent insights into risk factors through SHAP values and feature importance analysis
- **Personalized Recommendations**: Generates tailored retention strategies for at-risk employees
- **Real-time Monitoring**: Interactive Streamlit interface for immediate decision support

##  Project Objectives

### Financial Impact Mitigation
Reduces costs associated with recruitment, onboarding, and training by identifying at-risk employees before they leave.

### Knowledge Retention
Prevents the loss of critical institutional knowledge caused by employee turnover.

### Precision Analytics
Identifies specific risk factors using systematic feature importance analysis (XAI), enabling targeted interventions.

### Personalized Action Plans
Generates targeted retention offers and recommendations tailored to individual employee profiles.

##  Scope

### Comprehensive Data Processing
End-to-end processing and analysis of anonymized HR datasets, ensuring privacy while extracting actionable insights.

### Predictive Modeling
CatBoost classification model trained to calculate the probability of employee churn with high accuracy.

### Explainable AI (XAI)
Leverages SHAP values and feature importance to interpret and explain the underlying drivers of every risk score, ensuring transparency and trust.

### Interactive Deployment
Integrated into a Streamlit user interface for real-time monitoring and decision support accessible to all HR professionals.

##  Illustrative Use Case: "Bob"

To demonstrate the platform's practical value, consider this representative scenario:

**Profile**: Bob, a 45-year-old divorced employee with 5 years of tenure

**Risk Assessment**: Flagged as high risk for attrition

**Root Cause Diagnosis**:
- Need for flexibility due to personal life changes
- 3-year salary stagnation
- Limited career advancement opportunities

**Automated Action Plan**:
1. **Flexible Remote Work**: Offer hybrid or remote work arrangements
2. **Salary Review/Performance Bonus**: Initiate compensation adjustment
3. **Management Training**: Provide career development opportunities to boost trajectory

This targeted approach addresses Bob's specific concerns, significantly improving retention likelihood.

##  Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Core Language** | Python | End-to-end development |
| **ML Model** | CatBoost Classifier | Robust attrition prediction |
| **Interpretability** | SHAP + CatBoost Feature Importance | Transparent decision-making |
| **User Interface** | Streamlit | Accessible, user-friendly deployment |

### Why CatBoost?

CatBoost was specifically chosen for its:
- Superior performance on categorical HR data
- Built-in explainability features
- Robust handling of missing values
- Fast training and prediction times

##  Using the Interface

### 1. Employee Identification
Quick access to individual employee data by entering an employee ID via the sidebar.

### 2. Visual Risk Assessment
Intuitive probability gauge displays the attrition risk score at a glance.

### 3. Driver Identification
Visual breakdown of the primary contributing factors behind the risk score, powered by CatBoost's feature importance analysis.

### 4. Automated Action Plan
Structured list of suggested retention solutions tailored to the employee's specific profile and risk factors.

##  Getting Started

### Prerequisites

```bash
python >= 3.8
pip install -r requirements.txt
```

### Installation

```bash
# Clone the repository
git clone https://github.com/vnavas1312/explainability16.git

# Navigate to the project directory
cd hr-app

# Install dependencies
npm install
```

### Running the Application

```
npm run dev
```

The interface will launch in your default web browser at `http://localhost:5173`

##  Features

- ✅ **Real-time Risk Scoring**: Instant attrition probability calculation
- ✅ **Explainable Predictions**: SHAP-based feature importance visualization
- ✅ **Personalized Recommendations**: Automated retention strategy generation
- ✅ **Interactive Dashboard**: User-friendly Streamlit interface
- ✅ **Data Privacy**: Anonymized employee data processing
- ✅ **Scalable Architecture**: Designed for enterprise-level deployment

##  Model Performance

The CatBoost classifier has been optimized for:
- High precision in identifying at-risk employees
- Low false-positive rates to avoid retention fatigue
- Balanced sensitivity to detect early warning signs

##  Business Impact

- **Cost Reduction**: Lower recruitment and training expenses
- **Productivity**: Maintain team cohesion and institutional knowledge
- **Employee Satisfaction**: Proactive problem-solving improves workplace culture
- **Strategic Planning**: Data-driven workforce management
