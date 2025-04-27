# Comandos para criar o backend do projeto
cd backend
# Criar e ativar ambiente virtual
python -m venv venv
# Ativar ambiente virtual
venv\Scripts\activate  # Windows

# Instalar dependências
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary python-decouple django-cors-headers Pillow

# Criar projeto Django
django-admin startproject backend .
cd backend

# Criar aplicação para autenticação
python manage.py startapp accounts