from app.database import get_db_collection

CITIES = [
    {"name": "Tokyo", "timezone": "Asia/Tokyo"},
    {"name": "San Diego", "timezone": "America/Los_Angeles"},
    {"name": "Las Vegas", "timezone": "America/Los_Angeles"},
    {"name": "London", "timezone": "Europe/London"},
    {"name": "Sydney", "timezone": "Australia/Sydney"},
    {"name": "New York", "timezone": "America/New_York"}
]

def get_city_readings():
    """Get latest weather reading for each city from timeseries collection."""
    collection = get_db_collection("readings")
    cities = []

    for city in CITIES:
        latest_doc = collection.find_one(
            {"city": city["name"]},
            sort=[("timestamp", -1)]
        )
        
        if latest_doc:
            cities.append({
                "city": latest_doc.get("city"),
                "timestamp": latest_doc.get("timestamp"),
                "features": latest_doc.get("features"),
                "timezone": latest_doc.get("timezone")
            })
        else:
            cities.append({
                "city": city["name"],
                "timestamp": None,
                "features": None,
                "timezone": city["timezone"]
            })

    return cities


def get_city_history():
    """Get weather data history - returns latest reading per city."""
    return get_city_readings()


def get_city_history_graph(limit: int = 600):
    """Get weather data history for graphing - returns last N readings per city."""
    collection = get_db_collection("readings")
    results = []
    
    for city in CITIES:
        docs = list(collection.find(
            {"city": city["name"]}
        ).sort("timestamp", -1).limit(limit))
        
        for doc in docs:
            results.append({
                "city": doc.get("city"),
                "timestamp": doc.get("timestamp"),
                "features": doc.get("features"),
                "timezone": doc.get("timezone")
            })
    
    return results
