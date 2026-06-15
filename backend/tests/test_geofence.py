from app.services.geofence import haversine_meters, inside_geofence


def test_haversine_zero():
    assert haversine_meters(-22.52, -41.94, -22.52, -41.94) == 0.0


def test_inside_geofence_true():
    geofence = {"lat": -22.5220, "lng": -41.9472, "radiusMeters": 300}
    coords = {"lat": -22.5221, "lng": -41.9473}  # ~15 m
    assert inside_geofence(coords, geofence) is True


def test_inside_geofence_false():
    geofence = {"lat": -22.5220, "lng": -41.9472, "radiusMeters": 100}
    coords = {"lat": -22.5300, "lng": -41.9500}  # ~900 m
    assert inside_geofence(coords, geofence) is False
