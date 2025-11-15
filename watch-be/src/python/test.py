import joblib
le = joblib.load("label_encoder.pkl")
print(le.classes_)
