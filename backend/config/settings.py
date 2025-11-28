"""
Django settings for config project.
"""
import os
import environ
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------------------------------
# CONFIGURACIÓN DE ENTORNO (env)
# -----------------------------------------------------

env = environ.Env(
    # Define valores por defecto y tipos para variables críticas
    DEBUG=(bool, False) 
)

environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# -----------------------------------------------------
# SEGURIDAD Y CONFIGURACIÓN BÁSICA
# -----------------------------------------------------

# SECURITY WARNING: keep the secret key used in production secret!
# Obtener SECRET_KEY desde .env. Si no existe, usa la clave insegura (solo desarrollo)
SECRET_KEY = env('SECRET_KEY', default='django-insecure-6e)+xl=^@@0(0hhj@!n^v4=b2t*3)64ineq6((s=9=2x^on-b(')


DEBUG = env('DEBUG', default=True)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])



INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'pedidos',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# -----------------------------------------------------
# CORS
# -----------------------------------------------------

CORS_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# -----------------------------------------------------
# ARCHIVOS
# -----------------------------------------------------

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static_root' 

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# -----------------------------------------------------
# BASE DE DATOS
# -----------------------------------------------------



DATABASES = {
    'default': {
        'ENGINE': env('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': env('DB_NAME', default=BASE_DIR / 'db.sqlite3'),
        'USER': env('DB_USER', default=''),
        'PASSWORD': env('DB_PASSWORD', default=''),
        'HOST': env('DB_HOST', default=''),
        'PORT': env.int('DB_PORT', default=3306),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

if env('DB_ENGINE', default=None) == 'django.db.backends.mysql':
     DATABASES['default'] = {
        'ENGINE': env('DB_ENGINE'),
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env.int('DB_PORT'), # Usar env.int() para puertos
        # Opciones de MySQL/MariaDB (si fueran necesarias, como el charset)
        # 'OPTIONS': {'charset': 'utf8mb4'},
     }
else:
    # Usar el antiguo método si por alguna razón no se carga el motor
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }

# FIN DE ALTERNATIVA
# -----------------------------------------------------

# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# -----------------------------------------------------
# I18N
# --------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

# -----------------------------------------------------
# MISCELÁNEO
# -----------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'