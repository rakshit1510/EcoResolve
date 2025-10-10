import joblib
import os

def quick_predict():
    # Find model automatically
    model_paths = [
        'comprehensive_model.joblib',
        'enhanced_model.joblib',
        'model_tfidf.joblib',
        'models/comprehensive_model.joblib'
    ]
    
    model_path = None
    for path in model_paths:
        if os.path.exists(path):
            model_path = path
            break
    
    if not model_path:
        print("❌ No trained model found!")
        print("Please train a model first:")
        print("  python train_with_severity.py")
        return
    
    print(f"✅ Loaded model: {model_path}")
    model_data = joblib.load(model_path)
    
    # Simple prediction loop
    print("\n🎯 Quick Issue Classifier")
    print("Type 'quit' to exit\n")
    
    while True:
        issue = input("Enter issue: ").strip()
        if issue.lower() in ['quit', 'exit', 'q']:
            break
            
        if issue:
            try:
                if 'category_pipeline' in model_data:
                    # Comprehensive model
                    category = model_data['category_pipeline'].predict([issue])[0]
                    severity = model_data['severity_pipeline'].predict([issue])[0]
                    category_name = model_data['label_encoder'].inverse_transform([category])[0]
                    severity_name = model_data['severity_encoder'].inverse_transform([severity])[0]
                    print(f"→ {category_name} | Severity: {severity_name}\n")
                else:
                    # Basic model
                    prediction = model_data['pipeline'].predict([issue])[0]
                    category = model_data['label_encoder'].inverse_transform([prediction])[0]
                    print(f"→ {category}\n")
            except Exception as e:
                print(f"❌ Error: {e}\n")

if __name__ == "__main__":
    quick_predict()