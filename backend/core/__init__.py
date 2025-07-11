"""
Module core - Configuration et composants partagés
"""
from .config import settings
from .database import get_db

__all__ = ['settings', 'get_db']