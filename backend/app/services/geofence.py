"""Cálculo de geofencing (perímetro seguro).

Usa a fórmula de Haversine para medir a distância entre a posição atual e o
centro do perímetro configurado pelo usuário.
"""

from __future__ import annotations

import math

EARTH_RADIUS_M = 6_371_000.0


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distância em metros entre dois pontos (graus decimais)."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(a))


def inside_geofence(coordinates: dict, geofence: dict) -> bool:
    """True se ``coordinates`` está dentro do perímetro ``geofence``.

    ``coordinates``: {"lat": .., "lng": ..}
    ``geofence``:    {"lat": .., "lng": .., "radiusMeters": .., "enabled": ..}
    """
    distance = haversine_meters(
        coordinates["lat"],
        coordinates["lng"],
        geofence.get("lat", 0.0),
        geofence.get("lng", 0.0),
    )
    return distance <= geofence.get("radiusMeters", 0.0)
