Nathan Georges, Victor Navas Fernandez, LP, Arjuna Santhosh, Thomas Wartelle

Team 16

**Project Overview**

 -HR analytics platform designed to anticipate employee attrition.

 -Converts departure risks into strategic retention opportunities.

 -Leverages Machine Learning to shift HR management from reactive to proactive.

 -Enables a data-driven strategy for talent retention.

**Project Objectives**

 -Financial Impact Mitigation: Reduces costs associated with recruitment, onboarding, and training.

 -Knowledge Retention: Prevents the loss of institutional knowledge caused by employee turnover.

 -Precision Analytics: Identifies specific risk factors using systematic feature importance analysis (XAI).

 -Personalized Action Plans: Generates targeted retention offers and recommendations tailored to individual employee profiles.

**Scope**

 -Comprehensive Data Processing: Includes the end-to-end processing and analysis of anonymized HR datasets.

 -Predictive Modeling: Features a CatBoost classification model trained to calculate the probability of employee churn.

 -Explainable AI (XAI): Leverages SHAP values and feature importance to interpret and explain the underlying drivers of every risk score.

 -Interactive Deployment: Integrated into a Streamlit user interface for real-time monitoring and decision support.

**Illustrative Use Case**

 -Practical Demonstration: Illustrates the tool’s value through a representative employee profile, "Bob."

 -Targeted Identification: Flags a 45-year-old divorced employee with 5 years of tenure as a high risk for attrition.

 -Root Cause Diagnosis: Pinpoints specific drivers such as need for flexibility due to personal life changes and 3-year salary stagnation.

 -Automated Action Plan: Generates specific retention offers, including flexible remote work, a salary review/performance bonus, and management training to boost career trajectory.

**Technical Stack**

 -Core Language: Built entirely on Python.

 -Robust Modeling: Utilizes a CatBoost Classifier, specifically chosen for its effectiveness and its explainability in HR data.

 -Advanced Interpretability: Ensures transparency by combining SHAP values with CatBoost’s native feature importance modules.

 -User-Centric Design: Developed with Streamlit to provide a seamless interface accessible to HR professionals regardless of their technical background.

**Using the Interface**

 -Employee Identification: Quick access to individual data by entering an employee ID via the sidebar.

 -Visual Risk Assessment: Displays the attrition probability through an intuitive probability gauge.

 -Driver Identification: Highlights the primary contributing factors behind the score, powered by the CatBoost model's analysis.

 -Automated Action Plan: Presents a structured list of suggested retention solutions tailored to the employee's specific profile.
