import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

def main():
    # Load the comprehensive dataset
    df = pd.read_csv('urban_issues_dataset.csv')
    
    print(f"Dataset loaded: {len(df)} samples")
    print(f"Categories: {df['label'].nunique()}")
    print(f"Severity levels: {df['severity'].value_counts()}")
    
    # Prepare features and multiple targets
    X = df['text'].values
    
    # Encode both label and severity
    le_label = LabelEncoder()
    le_severity = LabelEncoder()
    
    y_label = le_label.fit_transform(df['label'])
    y_severity = le_severity.fit_transform(df['severity'])
    
    # Combine into multi-output target
    y = np.column_stack([y_label, y_severity])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y_label
    )
    
    # Split multi-output targets
    y_train_label, y_train_severity = y_train[:, 0], y_train[:, 1]
    y_test_label, y_test_severity = y_test[:, 0], y_test[:, 1]
    
    # Create pipeline for classification
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=15000,
            min_df=2,
            max_df=0.9,
            stop_words='english'
        )),
        ('clf', LogisticRegression(
            max_iter=2000,
            class_weight='balanced',
            C=1.0,
            random_state=42
        ))
    ])
    
    # Train label classifier
    print("Training category classifier...")
    pipeline.fit(X_train, y_train_label)
    
    # Predictions for category
    y_pred_label = pipeline.predict(X_test)
    
    print("\n📊 Category Classification Results:")
    print(classification_report(y_test_label, y_pred_label, target_names=le_label.classes_))
    
    # Train severity classifier
    print("Training severity classifier...")
    pipeline_severity = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=10000,
            min_df=2,
            max_df=0.9,
            stop_words='english'
        )),
        ('clf', LogisticRegression(
            max_iter=2000,
            class_weight='balanced',
            C=1.0,
            random_state=42
        ))
    ])
    
    pipeline_severity.fit(X_train, y_train_severity)
    y_pred_severity = pipeline_severity.predict(X_test)
    
    print("\n📊 Severity Classification Results:")
    print(classification_report(y_test_severity, y_pred_severity, target_names=le_severity.classes_))
    
    # Save models
    model_data = {
        'category_pipeline': pipeline,
        'severity_pipeline': pipeline_severity,
        'label_encoder': le_label,
        'severity_encoder': le_severity
    }
    
    joblib.dump(model_data, 'comprehensive_model.joblib')
    print(f"\n✅ Comprehensive model saved!")
    
    # Test predictions
    test_samples = [
        "Large pothole damaging vehicles on highway",
        "Small crack in sidewalk",
        "Electrical wires sparking dangerously",
        "Overflowing trash bins in park",
        "Fallen tree blocking road completely"
    ]
    
    print("\n🧪 Test Predictions:")
    for sample in test_samples:
        category_pred = pipeline.predict([sample])[0]
        severity_pred = pipeline_severity.predict([sample])[0]
        
        category_name = le_label.inverse_transform([category_pred])[0]
        severity_name = le_severity.inverse_transform([severity_pred])[0]
        
        print(f"'{sample}'")
        print(f"  → Category: {category_name}, Severity: {severity_name}")
        print()

if __name__ == "__main__":
    main()