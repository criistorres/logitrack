# Comandos para criar o backend do projeto
cd backend
# Criar e ativar ambiente virtual
python -m venv venv
# Ativar ambiente virtual
venv\Scripts\activate  # Windows

# Instalar dependências
pip install django==4.2.7
pip install djangorestframework==3.14.0
pip install djangorestframework-simplejwt==5.3.0
pip install django-cors-headers==4.3.0
pip install python-decouple==3.8
pip install Pillow
pip install psycopg2-binary

# Opcional: salvar as dependências em um arquivo requirements.txt
pip freeze > requirements.txt


# Criar o projeto principal
django-admin startproject logitrack .

# Criar o app para autenticação e usuários
python manage.py startapp accounts